<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui';

defineProps<{
  options: BreadcrumbItem[];
}>();
</script>

<template>
  <UBreadcrumb
    :items="options"
    :ui="{
      list: 'gap-2',
      item: 'font-normal text-[15px] text-[#999999]',
      separator: 'mx-2',
    }"
  >
    <template #item-label="{ active, item }">
      <span
        class="text-[15px]"
        :class="[active ? 'text-active font-semibold' : 'text-[#999999]']"
      >
        {{ item.label }}
      </span>
    </template>
    <template #separator>
      <span class="text-[#999999] select-none">/</span>
    </template>
  </UBreadcrumb>
</template>

<style lang="scss" scoped>
.text-active {
  color: var(--ui-breadcrumb-active-text-color);
}
</style>
