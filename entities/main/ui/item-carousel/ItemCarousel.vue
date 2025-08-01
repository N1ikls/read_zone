<script lang="ts" setup>
import type { Book } from '~/shared/types';

defineProps<{
  items: Book[] | null;
}>();
</script>

<template>
  <UCarousel
    v-if="items"
    v-slot="{ item }"
    loop
    drag-free
    :duration="0"
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
