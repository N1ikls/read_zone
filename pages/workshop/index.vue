<script setup lang="ts">
import { debounce } from 'es-toolkit';
import { ItemCard, ItemFilter } from '@/entities/workshop';

import type { CatalogResponse } from '~/shared/types';
import { isEmpty } from 'es-toolkit/compat';

const queries = useGetRouteQuery({
  name: null,
  page: 1,
  limit: 10,
});
const setRouteQueries = useSetRouteQuery();

const debounceParsedQueries = ref(unref(queries));

const { data } = useFetch<CatalogResponse>('/api/catalog', {
  query: debounceParsedQueries,
});

const isItems = computed(() => !isEmpty(data.value?.items));

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
    <template #title>
      <div class="text-2xl leading-xl font-semibold text-foreground cs-text">
        Мастерская
      </div>
    </template>

    <item-filter :queries="queries" />

    <template v-if="isItems">
      <div
        class="relative grid gap-2 w-full grid-cols-2 sm:grid-cols-2 xs:grid-cols-2 gap-y-4 md:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        <item-card
          v-for="item in data?.items"
          :key="item.id"
          :item="item"
        />
      </div>

      <r-pagination
        class="mt-4"
        :page="Number(queries?.page)"
        :limit="Number(queries?.limit)"
        :total="Number(data?.total)"
        @update-page="handlePageChange"
      />
    </template>
  </NuxtLayout>
</template>
