<script setup lang="ts">
import { Type } from '@/entities/catalog';
import type { Book } from '~/shared/types';

const { items = [] } = defineProps<{
  items: Book[];
}>();
</script>

<template>
  <div
    class="relative grid grid-cols-3 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
  >
    <template
      v-for="(item, index) in items"
      :key="index"
    >
      <nuxt-link
        :to="`/book/${item.id}`"
        class="item-card"
      >
        <r-card-default :item="item" />
      </nuxt-link>
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
