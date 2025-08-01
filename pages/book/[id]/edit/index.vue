<script lang="ts" setup>
import { useVirtualList } from '@vueuse/core';

import { ItemCard } from './ui';
import type { Book, Chapter } from '~/shared/types';
import { ROUTES } from './consts';
import {
  useChaptersActions,
  ModalActionChapter,
  ModalNewChapter,
} from '@/entities/book';
import { format, parseISO } from 'date-fns';

definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();

const setRouteQueries = useSetRouteQuery();

const queries = useGetRouteQuery({
  order: 'desc',
});

const isRotated = ref<boolean>(unref(queries).order === 'asc');

const guid = computed(() => route.params.id as string);

const { data } = await useFetch<Book>('/api/book', {
  key: `book-edit-${guid.value}`,
  method: 'get',
  query: {
    id: guid,
  },
  default: () => null,
});

const { data: chapters, refresh } = await useFetch<Chapter[]>('/api/chapters', {
  key: `chapters-${guid.value}-${queries.value.order}`,
  method: 'get',
  query: {
    book_id: guid,
    number: computed(() => queries.value.order),
  },
  default: () => [],
});

const normalizedChapters = computed(() => chapters.value ?? []);

const { list, containerProps, wrapperProps } = useVirtualList(
  normalizedChapters,
  {
    itemHeight: 32,
    overscan: 10,
  },
);

const { isGuids, guidsChecked, isAllChecked, toggleGuid, toggleAll } =
  useGuidsChecked(normalizedChapters);

const { options, deleteChapter } = useChaptersActions({ refresh });

const toggleRotation = () => {
  isRotated.value = !isRotated.value;
  setRouteQueries({ order: isRotated.value ? 'asc' : 'desc' });
};

const onAddChapter = async (item: Partial<Chapter>) => {
  await $fetch('/api/chapter/add', {
    method: 'post',
    body: {
      book_id: guid.value,
      ...item,
    },
  });

  refresh();
};
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb> <r-breadcrumb :options="ROUTES" /> </template>

    <template #title> Режим переводчика </template>

    <div class="edit mt-[30px] w-full h-full">
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

            <span class="light:text-[#000000] hidden md:block xl:block">
              Сортировать
            </span>
          </u-button>

          <div class="flex flex-wrap items-center gap-4">
            <modal-action-chapter
              title="Выставить на распродажу"
              btn-text="На распродажу"
              :items="normalizedChapters"
              negative-text="Отмена"
              positive-text="Подтвердить"
            >
              <u-button
                variant="outline"
                color="info"
                :disabled="!isGuids"
                class="text-sm ring-[#0862E0] light:text-[#050505] rounded-[10px]"
                size="lg"
              >
                На распродажу
              </u-button>
            </modal-action-chapter>

            <u-button
              variant="outline"
              color="info"
              class="text-sm ring-[#0862E0] light:text-[#050505] rounded-[10px]"
              size="lg"
              :disabled="!isGuids"
              @click="deleteChapter(guid, Array.from(guidsChecked.values()))"
            >
              Удалить
            </u-button>

            <modal-new-chapter @positive="onAddChapter" />
          </div>
        </div>

        <div class="light:bg-[#F5F5F5] pb-4 rounded-[10px]">
          <div class="overflow-x-auto md:overflow-x-visible">
            <div class="min-w-[600px] md:min-w-0">
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
                class="max-h-[450px] overflow-auto scrollbar px-4"
              >
                <div v-bind="wrapperProps">
                  <template
                    v-for="{ index, data } in list"
                    :key="index"
                  >
                    <div class="grid gap-2 grid-cols-[4fr_1fr_32px_32px]">
                      <r-list-item
                        :key="index"
                        :guid="data.id"
                        :checked="guidsChecked.has(data.id)"
                        @checkbox-toggled="toggleGuid"
                        checked-allowed
                        :options="options(data)"
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
      </div>
    </div>
  </NuxtLayout>
</template>
