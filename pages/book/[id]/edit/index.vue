<script lang="ts" setup>
import { useVirtualList } from '@vueuse/core';

import { ItemCard } from './ui';
import type { Book, Chapter } from '~/shared/types';
import { ROUTES } from './consts';

import { format, parseISO } from 'date-fns';
import type { DropdownMenuItem } from '@nuxt/ui';

definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();
const setRouteQueries = useSetRouteQuery();

const queries = useGetRouteQuery({
  order: 'desc',
});

const isRotated = ref<boolean>(unref(queries).order === 'asc');

const { data } = await useFetch<Book>('/api/book', {
  method: 'get',
  query: {
    id: route.params.id,
  },
});

const { data: chapters } = await useFetch<Chapter[]>('/api/chapters', {
  method: 'get',
  query: {
    book_id: route.params.id,
    number: computed(() => queries.value.order),
  },
});

const normalizedChapters = computed(() => chapters.value ?? []);

const { list, containerProps, wrapperProps } = useVirtualList(
  normalizedChapters,
  {
    itemHeight: 32,
    overscan: 10,
  },
);

const { guidsChecked, isAllChecked, toggleGuid, toggleAll } =
  useGuidsChecked(normalizedChapters);

const toggleRotation = () => {
  isRotated.value = !isRotated.value;
  setRouteQueries({ order: isRotated.value ? 'asc' : 'desc' });
};

const options = (number: number): DropdownMenuItem[] => [
  {
    label: 'Редактировать',
    icon: 'i-lucide-edit',
    color: 'info',
  },
  {
    label: 'Заблокировать',
    icon: 'my-icons:lock',
    color: 'info',
  },
  {
    label: 'Удалить',
    icon: 'i-lucide-trash',
    color: 'error',
    onSelect: async () => {
      await $fetch('/api/chapter/delete', {
        method: 'post',
        query: {
          guid: route.params.id,
          number: number,
        },
      });
    },
  },
];
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb> <r-breadcrumb :options="ROUTES" /> </template>

    <template #title> Режим переводчика </template>

    <div
      v-if="data"
      class="edit mt-[30px] w-full h-full"
    >
      <item-card :item="data" />

      <div class="mt-[40px]">
        <div class="flex flex-wrap items-center justify-between mb-[20px]">
          <u-button
            color="secondary"
            class="text-sm rounded-[10px]"
            size="lg"
            @click="toggleRotation"
          >
            <u-icon
              class="mt-[2px] light:text-[#000000] transition-transform duration-100"
              name="my-icons:arrow-at"
              :class="{ 'rotate-180': isRotated }"
              mode="svg"
            />

            <span class="light:text-[#000000] hidden md:block xl:block"
              >Сортировать</span
            >
          </u-button>

          <div class="flex flex-wrap items-center gap-4">
            <u-button
              variant="outline"
              color="info"
              class="text-sm ring-[#0862E0] light:text-[#050505] rounded-[10px]"
              size="lg"
            >
              На распродажу
            </u-button>

            <u-button
              variant="outline"
              color="info"
              class="text-sm ring-[#0862E0] light:text-[#050505] rounded-[10px]"
              size="lg"
            >
              Удалить
            </u-button>

            <u-button
              color="info"
              class="text-sm font-bold rounded-[10px]"
              size="lg"
            >
              Добавить главу
            </u-button>
          </div>
        </div>

        <div class="light:bg-[#F5F5F5] pb-4 rounded-[10px]">
          <div
            class="grid gap-2 grid-cols-[4fr_1fr_32px_32px] h-[50px] px-4 items-center"
          >
            <p class="text-sm font-light">Глава</p>
            <p class="text-sm font-light">Дата</p>

            <div
              class="p-2"
              @click.stop="toggleAll"
            >
              <u-checkbox
                color="info"
                size="lg"
                :model-value="isAllChecked"
                :ui="{
                  base: 'ring-2 ring-[#0862E0]',
                }"
              />
            </div>
          </div>

          <div
            v-bind="containerProps"
            class="h-[450px] overflow-auto scrollbar px-4"
          >
            <div
              v-bind="wrapperProps"
              class="grid gap-2"
            >
              <template
                v-for="{ index, data } in list"
                :key="index"
              >
                <div class="grid gap-2 grid-cols-[4fr_1fr_32px_32px]">
                  <r-list-item
                    :key="index"
                    :guid="data.number"
                    :checked="guidsChecked.has(data.number as number)"
                    @checkbox-toggled="toggleGuid"
                    checked-allowed
                    :options="options(data.number)"
                  >
                    <template #title>
                      <span class="text-base cs-text leading-xs font-bold">
                        {{ data.name }}
                      </span>
                    </template>

                    <template #default>
                      <p class="cs-text leading-xs text-xs font-normal">
                        {{
                          format(
                            parseISO(data.created_at as string),
                            'dd.MM.yyyy',
                          )
                        }}
                      </p>
                    </template>
                  </r-list-item>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>
