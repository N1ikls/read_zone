<script setup lang="ts">
import { Type } from '@/entities/catalog';
import type { Book } from '~/shared/types';
const { item } = defineProps<{
  item: Book;
}>();
</script>

<template>
  <nuxt-link
    class="cs-horizontal-title-card border-[#c2c2c2] bg-[#ffff] flex w-full flex-col items-center justify-between gap-4 overflow-hidden !rounded-md border p-2 md:flex-row light:hover:border-info dark:hover:bg-accent/20 transition-colors"
    :to="`/book/${item.id}`"
  >
    <div class="flex w-full items-center gap-4">
      <span
        class="relative inline-flex shrink-0 aspect-[2/3] overflow-hidden rounded-sm select-none w-8 md:w-12 lg:w-12"
      >
        <img
          class="select-none size-full object-cover transition-all duration-200"
          src="../../../../public//test_grid.png"
        />
      </span>

      <div class="mb-2 w-full">
        <span
          class="cs-text text-xs leading-xs mb-xxs font-normal line-clamp-1 text-muted-foreground text-ellipsis"
        >
          {{ Type[item.type as keyof typeof Type] }}
        </span>

        <span
          class="cs-text text-md leading-md font-medium line-clamp-2 text-foreground leading-[1.25] text-balance"
        >
          {{ item.name }}
        </span>
      </div>
    </div>
  </nuxt-link>
</template>
