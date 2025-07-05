<script lang="ts" setup>
import { parseISO, format } from 'date-fns';
import { ItemCard } from './ui';

const { guid } = defineProps<{
  guid: string;
}>();

const setRouteQueries = useSetRouteQuery();

const queries = useGetRouteQuery({
  order: 'desc',
});

const isRotated = ref<boolean>(unref(queries).order === 'asc');

const { data } = await useFetch('/api/chapters', {
  method: 'get',
  query: {
    book_id: guid,
    number: computed(() => queries.value.order),
  },
});

const toggleRotation = () => {
  isRotated.value = !isRotated.value;
  setRouteQueries({ order: isRotated.value ? 'asc' : 'desc' });
};
</script>

<template>
  <div class="light:bg-[#F5F5F5] rounded-[10px]">
    <div class="p-4 flex items-center justify-between gap-4">
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

        <span>Сортировать</span>
      </u-button>
      <div class="flex gap-4">
        <u-button
          color="info"
          class="text-sm fond-bold light:bg-[#ffffff] light:text-[#050505] hover:bg-[none]"
          >Режим переводчика</u-button
        >
        <u-button
          class="text-sm fond-bold light:bg-[#ffffff] light:text-[#050505] hover:bg-[none]"
          color="info"
          >Скачать
        </u-button>
      </div>
    </div>
    <div class="relative flex flex-col gap-2 w-full">
      <nuxt-link
        v-for="(item, index) in data"
        :key="index"
        to="/"
        @click.self
      >
        <ItemCard :item="item" />
      </nuxt-link>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.shadow {
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.25);
}
</style>
