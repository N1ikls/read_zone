<script setup lang="ts">
import numeral from 'numeral';
import { tabs } from './consts';
import { Status } from '@/entities/catalog';
import { ItemSidebar, ItemInfo, ItemChapter } from '@/entities/book';
import { isEmpty } from 'es-toolkit/compat';
import type { Book } from '~/shared/types';

const route = useRoute();

const { data } = await useFetch<Book>('/api/book', {
  method: 'get',
  query: {
    id: route.params.id,
  },
});

const { data: authorBooks } = await useFetch<Book[]>('/api/book/search', {
  method: 'get',
  query: {
    author_id: data.value?.author_id,
  },
});

// const formatCountChapters = computed(() => {
//   if (!data.value?.chapters_count) return 0;

//   const n = Math.abs(data.value.chapters_count) % 100;
//   const n1 = n % 10;

//   if (n > 10 && n < 20) return `${data.value?.chapters_count} Главы`;
//   if (n1 > 1 && n1 < 5) return `${data.value?.chapters_count} Главы`;
//   if (n1 === 1) return `${data.value?.chapters_count} Глава`;
//   return `${data.value?.chapters_count} Глав`;
// });
</script>

<template>
  <div
    v-if="data"
    class="book w-full xs:mt-[10vh] relative mt-[5vh] flex shrink-0 basis-auto flex-col items-start gap-6 md:mt-[80px] md:flex-row"
  >
    <item-sidebar />

    <div
      class="grid flex-[1] gap-y-4 [grid-template-areas:'header_header''content_content''similar_similar''comments_comments'] xl:[grid-template-areas:'header_header''content_content''content_similar''comments_similar']"
    >
      <header
        class="grid grid-cols-[1fr_min-content] gap-2 [grid-template-areas:'title_title''stats_stats''rating_rating'] sm:[grid-template-areas:'title_title''stats_rating'] xl:[grid-template-areas:'title_rating''stats_rating'] [grid-area:header]"
      >
        <div
          v-if="data?.name"
          class="font-bold text-[#000000] w-[80%] text-2xl leading-2xl ellipsis"
        >
          {{ data.name }}
        </div>

        <div
          class="flex w-full flex-row items-center justify-center gap-2 [grid-area:rating] md:flex-col md:items-end md:justify-center"
        >
          <div
            class="cs-text leading-md text-foreground flex flex-nowrap items-center gap-2 rounded-[10px] text-2xl leading-none font-bold select-none"
          >
            <u-icon
              mode="svg"
              class="rate"
              name="my-icons:rate"
            />

            {{ data?.rate.toFixed(1) }}
          </div>

          <u-button
            color="info"
            class="px-2 min-w-[20px] text-xs rounded-full h-[20px]"
            >Оценить</u-button
          >
        </div>

        <div
          class="book-content__footer cs-layout-stats-short-root flex flex-wrap justify-center gap-2 md:justify-start -mx-2 items-center [grid-area:stats]"
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
      </header>

      <UTabs
        color="info"
        :items="tabs(data?.chapters_count)"
        class="w-full [grid-area:content] min-w-0"
        :ui="{
          list: 'rounded-full light:bg-[#F5F5F5] h-9  shadow inset-shadow-2xs',
          indicator: 'rounded-full',
        }"
      >
        <template #info>
          <ItemInfo :item="data" />
        </template>
        <template #chapters>
          <ItemChapter :guid="data.id" />
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
</template>

<style lang="scss" scoped>
.absolute-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 544px;
  background: #f5f5f5;
  z-index: -1;
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
