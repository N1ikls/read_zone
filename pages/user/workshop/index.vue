<script setup lang="ts">
import { debounce } from 'es-toolkit';
import { ItemImg } from '@/entities/workshop';

import type { CatalogResponse } from '~/shared/types';
import { isEmpty } from 'es-toolkit/compat';

import { ACTIONS_BUTTONS } from './consts';

const queries = useGetRouteQuery({
  name: null,
  page: 1,
  limit: 10,
});
const setRouteQueries = useSetRouteQuery();

const debounceParsedQueries = ref(unref(queries));

const { data } = useFetch<CatalogResponse>('/api/catalog', {
  query: debounceParsedQueries,
});

const isItems = computed(() => !isEmpty(data.value?.items));

const handlePageChange = (page: number) => {
  setRouteQueries({ page: page.toString() });
};

watch(
  queries,
  debounce((newValue) => {
    debounceParsedQueries.value = newValue;
  }, 1000),
);
</script>

<template>
  <NuxtLayout name="default">
    <template #title> Моя мастерская </template>

    <template v-if="isItems">
      <div
        class="w-full relative mt-[5vh] flex shrink-0 basis-auto flex-col items-start gap-6 md:flex-row"
      >
        <div class="relative grid gap-2 w-full grid-cols-2 order-1">
          <item-img
            v-for="item in data?.items"
            :key="item.id"
            :item="item"
          />
        </div>

        <div class="w-full md:order-1 xl:w-[602px] grid gap-4">
          <div class="bg-[var(--bg-card)] rounded-[15px] p-4">
            <p class="text-[15px] mb-5">Ваша мастерская:</p>
            <p class="font-bold text-[22px] mb-2">456 подписчиков</p>

            Просмотреть
            <span class="text-[#0862E0]">соглашение подписчика</span>
          </div>

          <u-button
            v-for="action in ACTIONS_BUTTONS"
            color="secondary"
            class="pl-5 gap-4 justify-start text-foreground rounded-[15px] h-16 font-bold text-xl hover:bg-[none] cursor-pointer"
            block
          >
            <template #leading>
              <UIcon
                class="mt-1"
                name="my-icons:arrow-left"
              />
            </template>

            {{ action.name }}
          </u-button>

          <u-button
            class="font-bold h-13 text-[18px] rounded-[10px]"
            color="info"
            size="xl"
            block
          >
            Добавить работу
          </u-button>
        </div>
      </div>

      <r-pagination
        class="mt-4"
        :page="Number(queries?.page)"
        :limit="Number(queries?.limit)"
        :total="Number(data?.total)"
        @update-page="handlePageChange"
      />
    </template>
  </NuxtLayout>
</template>
