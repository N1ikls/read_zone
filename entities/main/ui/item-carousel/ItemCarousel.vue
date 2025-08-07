<script lang="ts" setup>
import { isEmpty } from 'es-toolkit/compat';
import type { Book } from '~/shared/types';

defineProps<{
  items: Book[];
}>();
</script>

<template>
  <template v-if="!isEmpty(items)">
    <UCarousel
      v-slot="{ item }"
      loop
      drag-free
      arrows
      wheel-gestures
      :items="items"
      :ui="{ item: 'basis-1/7' }"
    >
      <nuxt-link
        :to="`/book/${item.id}`"
        :key="item.id"
      >
        <r-card-default :item="item" />
      </nuxt-link>
    </UCarousel>
  </template>

  <div
    v-else
    class="overflow-hidden"
  >
    <div class="flex items-start flex-row gap-4 h-[314.27px]">
      <USkeleton
        v-for="n in 7"
        :key="n"
        class="rounded-[14px] min-w-0 shrink-0 h-[238.27px] w-[158.85px]"
      />
    </div>
  </div>
</template>
