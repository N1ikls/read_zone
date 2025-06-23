<script setup lang="ts">
import { debounce } from 'es-toolkit';
import { ItemCatalog } from './ui';
import { ROUTES } from './consts';
const setRouteQueries = useSetRouteQuery();

const queries = useGetRouteQuery({
  name: null,
  page: 1,
  limit: 10,
});

const debounceParsedQueries = ref(unref(queries));

const { data } = useFetch('/api/catalog', {
  query: debounceParsedQueries,
});

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
      <r-text size="v-large">Каталог</r-text>
    </template>

    <template v-if="data">
      <ItemCatalog
        :queries="queries"
        :items="data?.items || []"
      />

      <r-pagination
        :page="Number(queries?.page)"
        :limit="Number(queries?.limit)"
        :total="Number(data?.total)"
        @update-page="handlePageChange"
      />
    </template>
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
