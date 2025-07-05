<script setup lang="ts">
import { debounce } from 'es-toolkit';
import { ROUTES } from './consts';
import type { AcceptableValue } from '@nuxt/ui';
import { Status, ItemGrid } from '@/entities/bookmark';
const setRouteQueries = useSetRouteQuery();

const queries = useGetRouteQuery({
  name: null,
  page: 1,
  limit: 10,
  type: 'all',
});

const debounceParsedQueries = ref(unref(queries));
const name = ref<string | null>(queries.value?.name);

const { data } = useFetch('/api/bookmarks/items', {
  method: 'get',
  query: debounceParsedQueries,
});

const isGrid = useCookie<boolean | null>('isGrid', {
  default: () => false,
});

const iconLayout = computed(() =>
  isGrid.value ? 'heroicons-outline:view-grid' : 'heroicons-outline:view-list',
);

const onLayout = () => {
  isGrid.value = !isGrid.value;
};

const onUpdate = (value: AcceptableValue, key: string) => {
  setRouteQueries(resetPaginationQuery({ [key]: value as string }));
};

const handlePageChange = (page: number) => {
  setRouteQueries({ page: page.toString() });
};

watch(name, (value) => onUpdate(value, 'name'));

watch(
  queries,
  debounce((newValue) => {
    debounceParsedQueries.value = newValue;
  }, 1000),
);
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb> <r-breadcrumb :options="ROUTES" /> </template>

    <template #title>
      <r-header
        size="v-large"
        bottom="0"
        class="uppercase text-[#003386]"
      >
        Закладки
      </r-header>
    </template>

    <div class="bookmark">
      <div class="column">
        <div class="flex items-center gap-3">
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
                @click="name = null"
              />
            </template>
          </UInput>

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
        </div>

        <template v-if="data?.items">
          <item-grid
            v-if="isGrid"
            :items="data!.items"
          />

          <template v-else>
            <nuxt-link
              v-for="(item, index) in data.items"
              :key="index"
              :to="`/book/${item.id}`"
            >
              <r-card-status :item="item">
                <template #status>
                  {{ Status[item.bookmark_type as keyof typeof Status] }}
                </template>
              </r-card-status>
            </nuxt-link>
          </template>

          <UPagination
            :page="Number(queries.page)"
            show-edges
            :total="Number(data.total)"
            :items-per-page="Number(queries.limit)"
            @update:page="handlePageChange"
          />
        </template>
      </div>
      <!-- 
      <div class="w-73 sidebar">
        <u-button
          v-for="(name, key) in Status"
          color="info"
          class="gap-4 rounded-[10px] h-[42px] text-[#FFFFFF] font-bold text-xl cursor-pointer"
          block
          :class="{ active: key === queries.type }"
          @click="onUpdate(key, 'type')"
        >
          {{ name }}
        </u-button>
      </div> -->
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.bookmark {
  display: flex;
  gap: 30px;
}

.column {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 30px;
}

.sidebar {
  position: sticky;
  top: calc(var(--header-height) + 30px);
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  gap: 16px;
}

.active {
  background-color: #003386;
}
</style>
