<script lang="ts" setup>
import type { Book, Chapter } from '~/shared/types';
import { TEXT_DOWNLOAD } from '../../consts';
import { ModalActionChapter } from '../modal-action-chapter';
import { ItemCard } from './ui';

const { item } = defineProps<{
  item: Book;
}>();

const setRouteQueries = useSetRouteQuery();

const queries = useGetRouteQuery({
  order: 'desc',
});

const isRotated = ref<boolean>(unref(queries).order === 'asc');

const { data, refresh } = await useFetch<Chapter[]>('/api/chapters', {
  key: `chapters-${item.id}`,
  method: 'get',
  query: {
    book_id: item.id,
    number: computed(() => queries.value.order),
  },
  default: () => [],
});

const toggleRotation = () => {
  isRotated.value = !isRotated.value;
  setRouteQueries({ order: isRotated.value ? 'asc' : 'desc' });
};
</script>

<template>
  <div class="light:bg-[#F5F5F5] rounded-[10px]">
    <div class="p-4 flex items-center flex-wrap justify-between gap-4">
      <u-button
        color="info"
        class="light:bg-[#ffffff] hover:bg-[none] light:text-[#050505] text-sm"
        @click="toggleRotation"
      >
        <u-icon
          class="mt-[2px] transition-transform duration-100"
          :class="{ 'rotate-180': isRotated }"
          name="my-icons:arrow-at"
          mode="svg"
        />

        <span class="hidden md:block xl:block">Сортировать</span>
      </u-button>

      <div
        v-if="item.is_writeable"
        class="flex gap-4"
      >
        <u-button
          color="info"
          class="text-sm font-bold light:bg-[#ffffff] light:text-[#050505] hover:bg-[none]"
          :to="`/book/${item.id}/edit`"
        >
          Режим переводчика
        </u-button>

        <modal-action-chapter
          :title="TEXT_DOWNLOAD"
          :items="data || []"
          positive-text="Скачать"
          negative-text="Отмена"
        >
          <u-button
            class="text-sm font-bold light:bg-[#ffffff] light:text-[#050505] hover:bg-[none]"
            color="info"
          >
            {{ TEXT_DOWNLOAD }}

            <u-icon
              class="text-[21px] text-[#050505]"
              name="my-icons:arrow-up-right"
              mode="svg"
            />
          </u-button>
        </modal-action-chapter>
      </div>
    </div>
    <div class="relative flex flex-col gap-2 w-full">
      <nuxt-link
        v-for="(item, index) in data"
        :key="index"
        :to="!item.is_public ? undefined : `/book/${item.book_id}/${item.id}`"
        @click.self
      >
        <item-card
          :item="item"
          :key="item.id"
        />
      </nuxt-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.shadow {
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.25);
}
</style>
