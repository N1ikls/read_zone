<script setup lang="ts">
import numeral from 'numeral';
import { tabs } from '../consts';
import { Status } from '@/entities/catalog';
import {
  ItemSidebar,
  ItemInfo,
  ItemChapter,
  ModalAgeRate,
} from '@/entities/book';
import { isEmpty } from 'es-toolkit/compat';
import type { Book } from '~/shared/types';

const route = useRoute();
const router = useRouter();

const my18 = useCookie<boolean>('my-18', {
  default: () => false,
});

const openAgeRate = ref(false);

const guid = computed(() => route.params?.id);

const { data } = await useAsyncData(
  computed(() => `book-${guid.value}`),
  async () => {
    const book = await $fetch<Book>('/api/book', {
      method: 'get',
      query: {
        id: guid.value,
      },
    });
    if (!book) return null;
    return book;
  },
);

const { data: authorBooks } = await useFetch<Book[]>('/api/book/search', {
  key: computed(() => `author-books-${data.value?.author_id}`),
  method: 'get',
  query: {
    author_id: data.value?.author_id,
  },
  default: () => [],
});

const active = computed({
  get() {
    return (route.query.tab as string) || 'main';
  },
  set(tab: string) {
    router.push({
      query: {
        ...route.query,
        tab: tab ?? undefined,
      },
    });
  },
});

onMounted(() => {
  if (!my18.value && data.value?.age_rate === '18') {
    openAgeRate.value = true;
  }
});
</script>

<template>
  <div class="wrapper">
    <div class="absolute-background" />

    <modal-age-rate v-model="openAgeRate" />

    <div
      v-if="data"
      class="book w-full xs:mt-[10vh] relative mt-[5vh] flex shrink-0 basis-auto flex-col items-start gap-6 md:mt-[140px] md:flex-row"
    >
      <item-sidebar
        :img="data.background"
        :statuses="data.status"
        :is-writeable="data.is_writeable"
      />

      <div class="grid flex-[1] gap-y-4">
        <header
          class="flex flex-col justify-between p-5 h-[285px] light:bg-[#ffffff] dark:bg-[var(--bg)] rounded-t-[15px]"
        >
          <div class="flex justify-between items-start">
            <p class="font-bold w-[80%] text-3xl ellipsis">
              {{ data?.name }}
            </p>

            <div class="flex flex-wrap gap-1 items-center">
              <u-icon
                mode="svg"
                class="rate"
                name="my-icons:rate"
              />

              <p class="font-bold">{{ data?.rate?.toFixed(2) }}</p>
            </div>
          </div>

          <div class="flex light:text-[#999999] text-base ellipsis">
            {{ data?.alt_name }}
          </div>

          <div
            class="book-content__footer cs-layout-stats-short-root flex flex-wrap justify-center gap-2 md:justify-start -mx-2 items-center"
          >
            <r-text
              class="px-2.5 py-1"
              icon="my-icons:eyes-black"
              :size-svg="18"
            >
              Просмотров:
              {{ numeral(data?.viewers_count).format('0.[0]a').toUpperCase() }}
            </r-text>

            <r-text
              class="px-2.5 py-1"
              :size-svg="16"
              icon="my-icons:like-black"
            >
              Лайков:
              {{ numeral(data?.likers_count).format('0.[0]a').toUpperCase() }}
            </r-text>

            <r-text
              class="px-2.5 py-1"
              :size-svg="18"
              icon="my-icons:timer"
            >
              {{ data?.year }} Год выхода</r-text
            >
            <r-text
              class="px-2.5 py-1"
              :size-svg="18"
              icon="my-icons:checked"
            >
              {{ Status[data?.status as keyof typeof Status] }}
            </r-text>
          </div>

          <div>Альтернативные названия</div>

          <div class="flex gap-3">
            <div class="p-1 flex-1 text-center light:bg-[#F5F5F5]">
              Название
            </div>

            <div class="p-1 flex-1 text-center light:bg-[#F5F5F5]">
              Название
            </div>
          </div>
        </header>

        <UTabs
          v-model="active"
          color="info"
          :unmountOnHide="false"
          :items="tabs(data?.chapters_count)"
          class="w-full min-w-0"
          :ui="{
            root: 'gap-4',
            list: 'rounded-[10px] light:bg-[#F5F5F5] overflow-x-scroll',
            indicator: 'rounded-[10px]',
            trigger: 'min-w-[auto]',
          }"
        >
          <template #main>
            <ItemInfo :item="data" />
          </template>
          <template #chapters>
            <ItemChapter :item="data" />
          </template>
        </UTabs>
      </div>
    </div>

    <div
      class="mt-[61px]"
      v-if="!isEmpty(authorBooks)"
    >
      <div
        class="cs-text text-2xl leading-2xl text-foreground cs-layout-title-text break-word leading-lg font-bold mb-4"
      >
        Другие работы переводчика
      </div>

      <UCarousel
        v-slot="{ item }"
        class="cursor-grab w-full"
        loop
        drag-free
        :duration="0"
        wheel-gestures
        :items="authorBooks"
        :ui="{
          item: 'basis-1/3  sm:basis-1/3 md:basis-1/5 lg:basis-1/7 xl:basis-1/7 ',
        }"
      >
        <nuxt-link :to="`/book/${item.id}`">
          <r-card-default :item="item" />
        </nuxt-link>
      </UCarousel>
    </div>
  </div>
</template>

<style lang="scss" scoped>
%absolute {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 480px;
  z-index: -1;
}

.light .absolute-background {
  @extend %absolute;
  background: linear-gradient(115.97deg, #5294ff 31.85%, #0e4aa9 77.99%);
}

.dark .absolute-background {
  @extend %absolute;
  background: linear-gradient(95.24deg, #0054dc 29.67%, #001c4a 100%);
}

.shadow {
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.25);
}

.layout {
  display: grid;
  grid-template-columns: minmax(200px, 285px) 3fr;
  gap: 20px;
}

.warning {
  :deep(svg) {
    font-size: 16px;
  }
}

.book {
  &__avatar {
    width: 288px;
    height: 379px;
    object-fit: cover;
    border-radius: 10px;
    margin-bottom: 15px;
  }

  &-content {
    &__header {
    }
  }
}
.rate {
  &:deep(path) {
    fill: #0862e0;
  }
}
.ellipsis {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
