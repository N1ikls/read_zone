<script setup lang="ts">
import { AppHeader } from '@/widgest/app-header';
import { AppFooter } from '@/widgest/app-footer';
import { theme } from '@/shared/consts';
</script>

<template>
  <u-app>
    <a-extract-style>
      <a-config-provider :theme="theme">
        <nuxt-layout name="main">
          <template #header><AppHeader /> </template>

          <NuxtPage />

          <template #footer><AppFooter /> </template>
        </nuxt-layout>
      </a-config-provider>
    </a-extract-style>
  </u-app>
</template>
