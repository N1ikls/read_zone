<script setup lang="ts">
import { debounce } from 'es-toolkit';
import { ROUTES } from './consts';

const setRouteQueries = useSetRouteQuery();

const queries = useGetRouteQuery({
  name: null,
  page: 1,
  limit: 10,
});

const debounceParsedQueries = ref(unref(queries));

const handlePageChange = (page: number) => {
  setRouteQueries({ page: page.toString() });
};

watch(
  queries,
  debounce((newValue) => {
    debounceParsedQueries.value = newValue;
  }, 1000),
);
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb> <r-breadcrumb :options="ROUTES" /> </template>

    <template #title>
      <r-header
        size="v-large"
        class="uppercase"
        >Закладки
      </r-header>
    </template>

    <div class="grid grid-cols-[4fr_1fr] gap-4">
      <UInput
        icon="i-lucide-search"
        size="md"
        :ui="{
          root: 'w-full',
          base: 'bg-[#F5F5F5] rounded-[10px]  h-9 placeholder:text-[#C2C2C2] placeholder:italic placeholder-text-base',
        }"
        variant="soft"
        placeholder="Найти по названию книги"
      />

      <div class="">
        <u-button
          class="gap-4 rounded-[10px] h-[42px] text-[#FFFFFF] bg-[#97BFFF] font-bold text-xl hover:bg-[none] cursor-pointer"
          block
        >
          Все
        </u-button>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.catalog {
  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 45px;
  }
}
</style>
