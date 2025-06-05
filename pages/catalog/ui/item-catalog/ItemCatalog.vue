<script lang="ts" setup>
import { ItemCard, ItemFilter, ItemSidebar } from '@/entities/catalog';

defineProps<{
  queries: Record<string, string | string[]>;
  items: any[];
}>();

import { useCatalogState } from '@/entities/catalog';
import { storeToRefs } from 'pinia';

const { isSidebar } = storeToRefs(useCatalogState());
</script>

<template>
  <div class="catalog">
    <div class="column">
      <ItemFilter :queries="queries" />

      <ItemCard
        v-for="(item, index) in items"
        :key="index"
        :item="item"
      />
    </div>

    <ItemSidebar
      v-if="isSidebar"
      :queries="queries"
    />
  </div>
</template>

<style lang="scss" scoped>
.catalog {
  display: flex;
  gap: 16px;
}

.column {
  display: flex;
  flex-direction: column;
  flex: 1;
}
</style>
