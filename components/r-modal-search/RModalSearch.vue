<script setup lang="ts">
import { debounce } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { ItemCard } from '@/entities/search';

import type { Book } from '~/shared/types';

const search = ref<string>('');
const open = ref<boolean>(false);
const queries = ref<{ name?: string }>({});

const searchHistory = useCookie<Array<{ query: string; date: string }>>(
  'search-history',
  {
    default: () => [],
  },
);
const { data } = await useFetch<Book[]>('/api/book/search', {
  query: queries,
});

const isHistory = computed(
  () => !isEmpty(searchHistory.value) && !search.value,
);

const addToSearchHistory = (query: string) => {
  if (!query.trim()) return;

  const newHistory = searchHistory.value.filter((item) => item.query !== query);

  newHistory.unshift({
    query,
    date: new Date().toUTCString(),
  });

  if (newHistory.length > 10) {
    newHistory.pop();
  }

  searchHistory.value = newHistory;
};

const removeHistoryItem = (query: string) => {
  searchHistory.value = searchHistory.value.filter(
    (item) => item.query !== query,
  );
};

const handleInput = debounce((value: string) => {
  queries.value.name = value;
  console.log(queries.value);
  if (value.trim()) {
    addToSearchHistory(value);
  }
}, 1000);

const onSearch = (query: string) => {
  search.value = query;
  queries.value.name = query;
};

const onClear = () => {
  search.value = '';
  queries.value = {};
};
</script>

<template>
  <u-modal
    v-model:open="open"
    :ui="{
      overlay: 'light:bg-black/80',
      content:
        'top-4 -translate-y-0 grid gap-2 rounded-[22px] p-2 max-sm:max-w-[calc(100vw-8px)] sm:max-w-2xl light:bg-[#f2f2f7] dark:bg-[#012053] divide-y-0',
    }"
  >
    <u-button
      class="cs-button z-0 cursor-pointer group relative items-center box-border appearance-none whitespace-nowrap font-medium subpixel-antialiased transition-all tap-highlight-transparent transform-gpu data-[pressed=true]:scale-[0.97] opacity-100 outline-none focus-visible:outline-hidden ring-0 rounded-full h-9 text-sm light:bg-[#ffffff] dark:bg-[#003386] text-secondary-foreground hover:bg-secondary/90 ml-2 flex gap-2 select-none"
      icon="i-lucide-search"
    >
      Поиск
    </u-button>

    <template #content>
      <div class="flex flex-row items-center gap-2">
        <UInput
          v-model="search"
          icon="i-lucide-search"
          size="md"
          :ui="{
            root: 'w-full mr-2',
            base: 'rounded-[10px] hover:bg-[none] text-[16px] h-9 placeholder:text-[#C2C2C2] placeholder:italic placeholder-text-base w-full rounded-full h-12 light:bg-[#ffff] dark:bg-[#003386] shadow border light:border-[#c2c2c2] dark:border-[#0862E0]',
            trailing: 'pe-1',
          }"
          variant="none"
          placeholder="Найти по названию книги"
          @input="handleInput($event.target.value)"
        >
          <template
            v-if="search"
            #trailing
          >
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-circle-x"
              aria-label="Clear input"
              @click="onClear"
            />
          </template>
        </UInput>

        <u-button
          class="rounded-full light:bg-[#ffff] dark:bg-[#003386] hover:bg-[none] ring-0 h-12 min-w-12 justify-center cursor-pointer light:text-[#26262E] dark:text-[#ffffff]"
          @click="open = false"
        >
          <u-icon
            name="my-icons:close-new"
            mode="svg"
            class="size-6"
          />
        </u-button>
      </div>

      <div
        v-if="isHistory"
        class="p-2 flex max-w-full flex-col overflow-x-auto rounded-md"
      >
        <u-button
          v-for="(item, index) in searchHistory.slice(0, 3)"
          :key="index"
          class="cs-button z-0 cursor-pointer group relative box-border appearance-none select-none whitespace-nowrap font-medium subpixel-antialiased transition-all tap-highlight-transparent transform-gpu data-[pressed=true]:scale-[0.97] opacity-100 outline-none focus-visible:outline-hidden ring-0 bg-transparent rounded-full h-9 min-w-9 text-sm light:hover:bg-info/10 dark:hover:bg-info/10 flex w-full max-w-full items-center justify-between px-3 pr-0 light:text-[#26262E] dark:text-[#FFFFFF]"
          @click.stop="onSearch(item.query)"
        >
          <div class="flex max-w-full items-center gap-2 truncate">
            <u-icon
              mode="svg"
              name="i-iconoir-clock-rotate-right"
              class="shrink-0 size-4"
            />

            <p
              class="cs-text text-sm leading-sm font-normal text-foreground max-w-full truncate"
            >
              {{ item.query }}
            </p>
          </div>

          <span
            class="shrink-0 cs-button z-0 cursor-pointer group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap font-medium subpixel-antialiased transition-all tap-highlight-transparent transform-gpu data-[pressed=true]:scale-[0.97] opacity-100 outline-none focus-visible:outline-hidden ring-0 bg-transparent rounded-full h-9 min-w-9 text-sm px-0 aspect-square hover:bg-info/20 hover:text-info"
            @click.stop="removeHistoryItem(item.query)"
          >
            <u-icon
              name="my-icons:close-new"
              mode="svg"
            />
          </span>
        </u-button>
      </div>

      <div
        v-if="!data"
        class="flex flex-col gap-3 rounded-md p-2"
      >
        <span class="ml-1 text-[14px] font-medium">Часто ищут</span>
      </div>

      <div
        v-if="isEmpty(data) && search"
        class="flex w-full flex-col items-center justify-center rounded-md h-[35vh]"
      >
        Пусто
      </div>

      <div
        v-else
        class="relative grid w-full grid-cols-1 md:grid-cols-2 gap-2"
      >
        <div
          v-for="(item, index) in data?.slice(0, 6)"
          :key="index"
        >
          <ItemCard :item="item" />
        </div>
      </div>
    </template>
  </u-modal>
</template>

<style lang="scss" scoped>
.shadow {
  box-shadow: 0px 0px 4px 0px #59595940;
}
</style>
