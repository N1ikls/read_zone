<script setup lang="ts">
import { debounce } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { ROUTES } from './consts';
import type { AcceptableValue } from '@nuxt/ui';
import { Status } from '@/entities/bookmark';
const setRouteQueries = useSetRouteQuery();

definePageMeta({
  middleware: ['auth'],
});

const queries = useGetRouteQuery({
  name: null,
  page: 1,
  limit: 10,
  type: 'all',
});

const debounceParsedQueries = ref(unref(queries));
const name = ref<string | null>(queries.value?.name);

const { data } = useFetch('/api/user/my-works', {
  method: 'get',
  query: debounceParsedQueries,
});

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
        Мои работы
      </r-header>
    </template>

    <template #title-extra>
      <u-button
        class="gap-4 w-70 rounded-[10px] h-[42px] text-[#FFFFFF] bg-[#0862E0] font-bold text-lg hover:bg-[none] cursor-pointer items-center justify-center"
      >
        Создать книгу
      </u-button>
    </template>

    <div
      v-if="!isEmpty(data?.items)"
      class="my-works"
    >
      <div class="w-50 sidebar">
        <u-button
          v-for="(name, key) in Status"
          class="gap-4 rounded-[10px] h-[42px] text-[#FFFFFF] bg-[#97BFFF] font-bold text-xl hover:bg-[none] cursor-pointer"
          block
          :class="{ active: key === queries.type }"
          @click="onUpdate(key, 'type')"
        >
          {{ name }}
        </u-button>
      </div>

      <div class="column">
        <UInput
          v-model="name"
          icon="i-lucide-search"
          :va="name"
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

        <div>
          <r-card-status
            v-for="(item, index) in data.items"
            :key="index"
            :item="item"
          >
            <template #status>
              {{ Status[item.bookmark_type as keyof typeof Status] }}
            </template>
          </r-card-status>

          <r-pagination
            :page="Number(queries.page)"
            :limit="Number(queries.limit)"
            :total="Number(data.total)"
            @update-page="handlePageChange"
          />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.my-works {
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
