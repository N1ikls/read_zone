<script lang="ts" setup>
import { ItemCard, ItemFilter, ItemSidebar } from '@/entities/catalog';

defineProps<{
  items: any[];
  filter: object;
  genres: object[];
  tags: object[];
}>();

import { useCatalogState } from '@/entities/catalog';
import { storeToRefs } from 'pinia';

const { isSidebar } = storeToRefs(useCatalogState());
</script>

<template>
  <div class="catalog">
    <div class="column">
      <ItemFilter />

      <ItemCard
        v-for="(item, index) in items"
        :key="index"
        :item="item"
      />
    </div>

    <ItemSidebar v-if="isSidebar" :filter="filter" :genres="genres" :tags="tags" />
  </div>
</template>

<style lang="scss" scoped>
.catalog {
  display: flex;
  align-items: center;
  gap: 16px;
}

.column {
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>
