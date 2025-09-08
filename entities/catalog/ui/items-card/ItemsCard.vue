<script lang="ts" setup>
import { isEmpty, isNull } from 'es-toolkit/compat';

import {
  ItemGrid,
  ItemCard,
  ItemFilter,
  ItemSidebar,
} from '@/entities/catalog';

import { useCatalogState } from '@/entities/catalog';
import { storeToRefs } from 'pinia';
import type { CatalogResponse } from '~/shared/types';

const { data = null } = defineProps<{
  queries: Record<string, string | string[]>;
  data: CatalogResponse | null;
}>();

const setRouteQueries = useSetRouteQuery();
const isGrid = useCookie<boolean | null>('isGrid', {
  default: () => false,
});

const { isSidebar } = storeToRefs(useCatalogState());

const handlePageChange = (page: number) => {
  setRouteQueries({ page: page.toString() });
};

const isEmptyItems = computed(() => isEmpty(data?.items));
</script>

<template>
  <div class="catalog">
    <div class="column">
      <ItemFilter :queries="queries" />

      <div
        class="grid gap-4"
        v-if="!isEmptyItems"
      >
        <item-grid
          v-if="isGrid"
          :items="data!.items"
        />

        <div
          v-else
          class="flex flex-col gap-4 flex-1"
        >
          <ItemCard
            v-for="(item, index) in data!.items"
            :key="index"
            :item="item"
          />
        </div>

        <r-pagination
          :page="Number(queries?.page)"
          :limit="Number(queries?.limit)"
          :total="Number(data?.total)"
          @update-page="handlePageChange"
        />
      </div>
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
