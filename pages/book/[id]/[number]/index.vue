<script setup lang="ts">
import { z } from 'zod';

const route = useRoute();
const queries = useGetRouteQuery({
  page: 1,
  limit: 10,
});
const setRouteQueries = useSetRouteQuery();

const id = computed(() => route.params.id);
const number = computed(() => route.params.number);

const { data } = useFetch('/api/chapter', {
  method: 'get',
  query: {
    book_id: id.value,
    number: number.value,
  },
  watch: [id, number],
  default: () => null,
});

const ROUTES = [
  { label: 'Главная', to: '/' },
  { label: 'Каталог', to: '/catalog' },
  { label: 'Книга', to: '/my-works' },
  { label: 'Создание книги', to: '/book/create' },
];

const handlePageChange = (page: number) => {
  setRouteQueries({ page: page.toString() });
};
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb>
      <r-breadcrumb :options="ROUTES" />
    </template>

    <template #title> Том 1. Хокаге; Глава 1. Начало </template>

    {{ data }}

    <div class="mb-4">
      <img
        class="w-full object-cover"
        src="../../../../public/test_chapter.jpg"
      />
    </div>
  </NuxtLayout>
</template>
