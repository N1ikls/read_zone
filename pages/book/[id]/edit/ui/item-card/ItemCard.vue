<script lang="ts" setup>
import numeral from 'numeral';
import type { Book } from '~/shared/types';

const { item } = defineProps<{
  item: Book;
}>();
</script>

<template>
  <div class="grid grid-cols-[159px_1fr] gap-6">
    <div class="bg-[#D6D6D6] rounded-[10px] xl:h-[211px] xl:w-[159px]"></div>

    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <span class="font-bold text-[26px] leading-none select-none">
          {{ item?.name }}
        </span>

        <div
          class="cs-text leading-md text-foreground font-semibold flex flex-nowrap items-center gap-2 text-[18px] leading-none select-none"
        >
          <u-icon
            mode="svg"
            class="rate text-[#0862E0]"
            name="my-icons:rate"
          />

          {{ item?.rate.toFixed(1) }}
        </div>
      </div>

      <div class="font-normal text-[16px] light:text-[#999999]">
        {{ item?.alt_name }}
      </div>

      <div
        class="book-content__footer cs-layout-stats-short-root flex flex-wrap justify-center gap-2 md:justify-start -mx-2 items-center [grid-area:stats]"
      >
        <r-text
          class="px-2.5 py-1"
          icon="my-icons:eyes-black"
          :size-svg="18"
        >
          Просмотров:
          {{ numeral(item?.viewers_count).format('0.[0]a').toUpperCase() }}
        </r-text>

        <r-text
          class="px-2.5 py-1"
          icon="my-icons:read"
          :size-svg="18"
        >
          Главы:
          {{ numeral(item?.chapters_count).format('0.[0]a').toUpperCase() }}
        </r-text>

        <r-text
          class="px-2.5 py-1"
          :size-svg="16"
          icon="my-icons:like-black"
        >
          Лайков:
          {{ numeral(item?.likers_count).format('0.[0]a').toUpperCase() }}
        </r-text>

        <r-text
          class="px-2.5 py-1"
          :size-svg="18"
          icon="my-icons:timer"
        >
          {{ item?.year }} Год выхода</r-text
        >
      </div>
    </div>
  </div>
</template>
