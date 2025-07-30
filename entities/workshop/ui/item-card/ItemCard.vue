<script lang="ts" setup>
import type { Book } from '~/shared/types';

const { item } = defineProps<{
  item: Book;
}>();
</script>

<template>
  <nuxt-link
    :to="`/workshop/${item.id}`"
    class="workshop-card bg-[var(--bg-card)] rounded-[15px] flex flex-col gap-4"
  >
    <span
      class="inline-flex shrink-0 relative w-full overflow-hidden rounded-[15px] select-none aspect-[1]"
    >
      <nuxt-img
        class="w-full h-full object-cover"
        :src="item.background"
      />

      <div
        class="cs-text flex flex-nowrap items-center gap-1 rounded-full bg-[#FFFFFF33] backdrop-blur-[10px] p-1 select-none absolute left-2 top-2"
      >
        <u-icon
          class="text-[#FFFFFF] size-4"
          mode="svg"
          name="my-icons:rate"
        />

        <p class="text-xs text-[#FFFFFF] font-semibold leading-none">
          {{ item.rate?.toFixed(2) }}
        </p>
      </div>
    </span>

    <div class="px-4 pb-4 flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <div
          class="font-bold text-[20px] text-ellipsis leading-xs line-clamp-2"
        >
          {{ item.name }}
        </div>
      </div>

      <div class="flex flex-wrap gap-1">
        <div
          v-for="genre in item.genres"
          :key="genre.id"
          class="py-1 px-2 light:bg-[#FFFFFF] dark:bg-[#003386] text-xs rounded-[10px]"
        >
          {{ genre.name }}
        </div>
      </div>
    </div>
  </nuxt-link>
</template>
