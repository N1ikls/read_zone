<script setup lang="ts">
import { RHeader } from '@/shared/ui';
definePageMeta({
  key: (route) => route.fullPath,
});
</script>

<template>
  <nuxt-layout name="default">
    <div class="container">
      <r-header
        class="main__title"
        level="1"
      >
        Популярные манги
      </r-header>
    </div>
  </nuxt-layout>
</template>
