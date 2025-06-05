<script setup lang="ts">
import { useCatalogState } from '@/entities/catalog';
import { storeToRefs } from 'pinia';

const { queries = {} } = defineProps<{
  queries: Record<string, unknown>;
}>();
const catalogState = useCatalogState();

const { showSidebar } = catalogState;
const { isSidebar } = storeToRefs(catalogState);

const setRouteQueries = useSetRouteQuery();

const name = computed(() => (queries?.name as string) || '');

const onUpdateName = (value: string) => {
  setRouteQueries(resetPaginationQuery({ name: value }));
};
</script>

<template>
  <div class="filters">
    <div class="filters__grid">
      <a-input
        class="input"
        :value="name"
        :bordered="false"
        placeholder="Найти по названию книги"
        @update:value="onUpdateName"
      >
        <template #prefix>
          <SearchOutlined />
        </template>
      </a-input>

      <a-button class="button">
        <template #icon>
          <Icon name="my-icons:sorter-low" />
        </template>
      </a-button>

      <a-button class="button">
        <template #icon> <Icon name="my-icons:sorter-up" /> </template>
      </a-button>

      <a-button
        v-if="!isSidebar"
        class="button-filter"
        type="primary"
        @click="showSidebar"
      >
        <Icon name="my-icons:filters" />
        <span class="button-filter__text">Фильтры</span>
      </a-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.filters {
  position: relative;

  &__grid {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 30px;
  }
}

.button {
  border-radius: 10px;
  min-width: 37px;
  height: 37px;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;

  span {
    font-size: 15px;
  }

  &-filter {
    display: flex;
    align-items: center;
    border-radius: 10px;
    height: 37px;

    &__text {
      margin-left: 6px;
    }
  }
}

.input {
  border-radius: 10px;
  background-color: #f5f5f5;
  min-height: 37px;
}
</style>
