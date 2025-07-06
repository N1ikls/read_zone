<script setup lang="ts">
import { useCatalogState } from '@/entities/catalog';
import { storeToRefs } from 'pinia';

const { queries = {} } = defineProps<{
  queries: Record<string, unknown>;
}>();

const catalogState = useCatalogState();

const { showSidebar } = catalogState;
const { isSidebar } = storeToRefs(catalogState);

const isGrid = useCookie<boolean | null>('isGrid', {
  default: () => false,
});
const setRouteQueries = useSetRouteQuery();

const name = ref(queries?.name as string);

const iconLayout = computed(() =>
  isGrid.value ? 'heroicons-outline:view-grid' : 'heroicons-outline:view-list',
);

const onLayout = () => {
  isGrid.value = !isGrid.value;
};

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
        color="secondary"
        class="rounded-[10px] flex items-center justify-center h-[37px] w-[40.52px]"
        @click="onSortDesc('updated_at')"
      >
        <u-icon
          mode="svg"
          name="my-icons:sorter-low"
        />
      </u-button>

      <u-button
        color="secondary"
        @click="onSortDesc('updated_at_asc')"
        class="rounded-[10px] flex items-center justify-center h-[37px] w-[40.52px]"
      >
        <u-icon
          mode="svg"
          name="my-icons:sorter-up"
        />
      </u-button>

      <u-button
        color="secondary"
        @click="onLayout"
        class="rounded-[10px] text-[#232323] flex items-center justify-center h-[37px] w-[40.52px]"
      >
        <u-icon
          class="text-[20px]"
          mode="svg"
          :name="iconLayout"
        />
      </u-button>

      <u-button
        v-if="!isSidebar"
        color="info"
        class="rounded-[10px]"
        @click="showSidebar"
      >
        <u-icon name="my-icons:filters" />
        <span class="font-bold">Фильтры</span>
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
