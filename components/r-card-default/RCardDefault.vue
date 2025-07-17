<script setup lang="ts">
import { Type } from '@/entities/catalog';
import type { Book } from '~/shared/types';
const { item } = defineProps<{
  item: Book;
}>();
</script>

<template>
  <div
    class="group cs-title-card cs-title-vertical-card relative flex h-full flex-col gap-3 overflow-hidden select-none"
  >
    <span
      class="inline-flex shrink-0 relative aspect-[2/3] w-full overflow-hidden rounded-[14px] select-none"
    >
      <img
        class="w-full object-cover"
        :src="item.background"
      />

      <p
        class="cs-text text-xs leading-xs font-semibold text bg flex flex-nowrap items-center gap-2 rounded-[22px] px-3 py-2 leading-none select-none absolute right-1 bottom-1"
      >
        <u-icon
          name="my-icons:star-new"
          mode="svg"
          class="text-[#0862e0]"
        />
        {{ item.rate.toFixed(1) }}
      </p>
    </span>

    <div class="flex flex-col gap-1 px-1 pb-1">
      <p
        class="cs-text text-xs leading-xs font-normal line-clamp-1 text-muted-foreground"
      >
        {{ Type[item.type as keyof typeof Type] }} {{ item.year }}
      </p>

      <p
        class="cs-text text-sm leading-sm font-medium line-clamp-2 text-foreground text-balance"
      >
        {{ item.name }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.text {
  color: hsl(240 9.5% 16.5%);
}
.bg {
  background-color: color-mix(in oklab, hsl(240 10% 95%) 70%, transparent);
}
</style>
