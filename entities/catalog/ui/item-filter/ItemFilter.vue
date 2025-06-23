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

const name = ref(queries?.name as string);

const onUpdateName = (value: string) => {
  setRouteQueries(resetPaginationQuery({ name: value }));
};

const onSortDesc = (value: string) => {
  setRouteQueries(resetPaginationQuery({ sort: value }));
};

watch(name, (value) => onUpdateName(value));
</script>

<template>
  <div class="filters">
    <div class="filters__grid">
      <UInput
        v-model="name"
        icon="i-lucide-search"
        size="md"
        :ui="{
          root: 'w-full mt-1',
          base: 'bg-[#F5F5F5] rounded-[10px]  h-9 placeholder:text-[#C2C2C2] placeholder:italic placeholder-text-base',
          trailing: 'pe-1',
        }"
        variant="soft"
        placeholder="Найти по названию книги"
      >
        <template
          v-if="name"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-circle-x"
            aria-label="Clear input"
            @click="name = ''"
          />
        </template>
      </UInput>
      <u-button
        class="button"
        @click="onSortDesc('updated_at')"
      >
        <u-icon name="my-icons:sorter-low" />
      </u-button>

      <u-button
        @click="onSortDesc('updated_at_asc')"
        class="button"
      >
        <u-icon name="my-icons:sorter-up" />
      </u-button>

      <u-button
        v-if="!isSidebar"
        class="button-filter bg-[#0862E0] hover:bg-[none] cursor-pointer"
        @click="showSidebar"
      >
        <u-icon name="my-icons:filters" />
        <span class="button-filter__text">Фильтры</span>
      </u-button>
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
