<script lang="ts" setup>
import type { BreadcrumbOptions } from '@/shared/types';

defineProps<{
  options: BreadcrumbOptions[];
}>();
</script>

<template>
  <a-breadcrumb>
    <a-breadcrumb-item
      v-for="option in options"
      :key="option.path"
    >
      <NuxtLink
        v-if="option.path"
        :to="option.path"
      >
        {{ option.name }}
      </NuxtLink>

      <span v-else>{{ option.name }}</span>
    </a-breadcrumb-item>
  </a-breadcrumb>
</template>
