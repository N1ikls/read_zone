<script setup lang="ts">
import type { Book } from '~/shared/types';
import type { BreadcrumbItem } from '@nuxt/ui';

const route = useRoute();

const { data } = await useAsyncData('book', async () => {
  const book = await $fetch<Book>('/api/book', {
    method: 'get',
    query: {
      id: route.params.id,
    },
  });
  if (!book) return null;
  return book;
});

const breadcrumb = computed<BreadcrumbItem[]>(() => [
  { to: '/', label: 'Главная' },
  { to: '/workshop', label: 'Мастерская' },
  { label: data.value?.author_name || '...' },
]);
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb>
      <r-breadcrumb :options="breadcrumb" />
    </template>

    <template #title>
      <div class="text-2xl leading-xl font-semibold text-foreground cs-text">
        {{ data?.author_name }}
      </div>
    </template>
  </NuxtLayout>
</template>
