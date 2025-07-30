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
      <NuxtImg
        class="w-full object-cover"
        :src="item.background"
      />

      <p
        class="cs-text text-[16px] leading-xs font-semibold text bg flex flex-nowrap items-center gap-1 rounded-[5px] px-2.5 py-2 leading-none select-none absolute right-2 top-2"
      >
        <u-icon
          name="my-icons:rate"
          mode="svg"
          class="text-[#0862e0]"
        />
        {{ item.rate?.toFixed(1) }}
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
  background: #ffffffbf;
  backdrop-filter: blur(12.899999618530273px);
}
</style>
