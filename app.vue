<script setup lang="ts">
import { AppHeader } from '@/widgest/app-header';
import { AppFooter } from '@/widgest/app-footer';
import { theme } from '@/shared/consts';
</script>

<template>
  <u-app
    :toaster="{
      position: 'top-center',
      progress: false,
      duration: 3000,
    }"
  >
    <nuxt-layout name="main">
      <template #header><AppHeader /> </template>

      <NuxtPage />

      <template #footer><AppFooter /> </template>
    </nuxt-layout>
  </u-app>
</template>
