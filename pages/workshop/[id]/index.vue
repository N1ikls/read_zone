<script setup lang="ts">
import type { Book } from '~/shared/types';

const route = useRoute();
const router = useRouter();

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
</script>

<template>
  <NuxtLayout name="default">
    <template #title>
      <div class="text-2xl leading-xl font-semibold text-foreground cs-text">
        {{ data?.author_name }}
      </div>
    </template>
  </NuxtLayout>
</template>
