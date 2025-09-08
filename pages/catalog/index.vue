<script setup lang="ts">
import { debounce } from 'es-toolkit';

import { ItemsCard } from '@/entities/catalog';
import type { CatalogResponse } from '~/shared/types';

const queries = useGetRouteQuery({
  name: null,
  page: 1,
  limit: 10,
});

const debounceParsedQueries = ref(unref(queries));

const { data } = useFetch<CatalogResponse>('/api/catalog', {
  key: 'catalog',
  query: debounceParsedQueries,
  default: () => ({ items: [], total: 0, page: 1, limit: 100 }),
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
    <template #title>
      <div class="text-2xl leading-xl font-semibold text-foreground cs-text">
        Каталог
      </div>
    </template>

    <items-card
      :data="data"
      :queries="queries"
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
