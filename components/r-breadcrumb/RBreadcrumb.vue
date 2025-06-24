<script lang="ts" setup>
import type { BreadcrumbItem } from '@nuxt/ui';

defineProps<{
  options: BreadcrumbItem[];
}>();
</script>

<template>
  <UBreadcrumb :items="options">
    <template #separator>
      <span class="text-[#FFFFFF]">/</span>
    </template>
  </UBreadcrumb>
</template>
