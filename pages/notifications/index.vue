<script setup lang="ts">
const queries = useGetRouteQuery({
  name: null,
  page: 1,
  limit: 100,
});

const { data } = await useFetch('/api/notifications', {
  method: 'get',
});

const debounceParsedQueries = ref(unref(queries));
</script>

<template>
  <NuxtLayout name="default">
    <template #title>
      <div class="text-2xl leading-xl font-semibold text-foreground cs-text">
        Уведомления
      </div>
    </template>

    {{ data }}
  </NuxtLayout>
</template>
