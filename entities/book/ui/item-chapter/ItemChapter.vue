<script lang="ts" setup>
import { parseISO, format } from 'date-fns';
import { ItemCard } from './ui';

const { guid } = defineProps<{
  guid: string;
}>();

const { data } = await useFetch('/api/chapters', {
  method: 'get',
  query: {
    book_id: guid,
  },
});
</script>

<template>
  <div class="relative flex flex-col gap-2 w-full">
    <nuxt-link
      v-for="(item, index) in data"
      :key="index"
      to="/"
      @click.self
    >
      <ItemCard :item="item" />
    </nuxt-link>
  </div>
</template>

<style lang="scss" scoped>
.shadow {
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.25);
}
</style>
