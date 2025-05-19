<script setup lang="ts">
import { ItemCatalog } from './ui';

const loading = ref(false);
const name = ref('');
const sort = ref('update');

const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = computed(() => data.value?.at(0)?.length || 0);

const data = ref([]);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return (
    data.value?.at(0)?.slice(start, end) ||
    Array.from({ length: 100 }, () => ({ name: 'dsadasdas' }))
  );
});

const books = ref(data.value?.[0] || []);
const filter = ref(data.value?.[1] || {});

const handlePageChange = (page: number) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleSizeChange = (current: number, size: number) => {
  currentPage.value = 1;
  pageSize.value = size;
};

function submit() {}
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

    <ItemCatalog :items="paginatedData" />

    <ClientOnly>
      <div
        v-if="totalItems > pageSize"
        class="catalog__pagination"
      >
        <a-pagination
          v-model:current="currentPage"
          :total="totalItems"
          :pageSize="pageSize"
          @change="handlePageChange"
          @showSizeChange="handleSizeChange"
          :show-size-changer="false"
        />
      </div>
    </ClientOnly>
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
