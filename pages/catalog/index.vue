<script setup lang="ts">
import { ItemCatalog } from './ui';

const queries = useGetRouteQuery({
  name: null,
});

function submit() {}

const { data } = useFetch('/api/catalog', {
  query: queries,
});
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

    <ItemCatalog
      :queries="queries"
      :items="data || []"
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
