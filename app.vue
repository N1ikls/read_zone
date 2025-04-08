<script setup lang="ts">
import { AppHeader } from '@/widgest/app-header';
import { theme } from '@/shared/consts';
</script>

<template>
  <a-extract-style>
    <a-config-provider :theme="theme">
      <nuxt-layout name="default">
        <template #header><AppHeader /></template>
        <NuxtPage />
      </nuxt-layout>
    </a-config-provider>
  </a-extract-style>
</template>
