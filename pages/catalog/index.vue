<script setup lang="ts">
import { debounce } from 'es-toolkit';
import { ItemCatalog } from './ui';

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
    <template #breadcrumb>
      <a-breadcrumb>
        <a-breadcrumb-item>Главная</a-breadcrumb-item>
        <a-breadcrumb-item>Каталог</a-breadcrumb-item>
      </a-breadcrumb>
    </template>

    <template #title>
      <r-text size="v-large">Каталог</r-text>
    </template>

    <template v-if="data">
      <ItemCatalog
        :queries="queries"
        :items="data?.items || []"
      />

      <div
        v-if="data?.items"
        class="catalog__pagination"
      >
        <a-pagination
          :current="Number(queries?.page)"
          :total="Number(data.total) || 0"
          :pageSize="Number(queries.limit)"
          @change="handlePageChange"
          :show-size-changer="false"
        />
      </div>
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
