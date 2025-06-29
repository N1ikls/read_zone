<script setup lang="ts">
import { Type } from '@/entities/catalog';
import type { Book } from '~/shared/types';

const { items = [] } = defineProps<{
  items: Book[];
}>();
</script>

<template>
  <div
    class="relative grid gap-2 w-full sm:grid-cols-4 xs:grid-cols-4 grid-cols-3 gap-y-4 md:grid-cols-3 md:gap-3 lg:grid-cols-4 xl:grid-cols-5"
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
