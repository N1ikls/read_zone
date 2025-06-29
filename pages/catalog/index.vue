<script setup lang="ts">
import { debounce } from 'es-toolkit';

import { ItemCatalog } from './ui';
import { ROUTES } from './consts';
import type { CatalogResponse } from '~/shared/types';

const queries = useGetRouteQuery({
  name: null,
  page: 1,
  limit: 100,
});

const debounceParsedQueries = ref(unref(queries));

const { data } = useFetch<CatalogResponse>('/api/catalog', {
  query: debounceParsedQueries,
});

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
      <r-text size="v-large">Каталог</r-text>
    </template>

    <ItemCatalog
      :queries="queries"
      :data="data"
    />
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
