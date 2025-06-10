<script setup lang="ts">
import { ItemSidebar } from '@/entities/user';
import { ROUTES } from './consts';
const route = useRoute();

const guid = computed(() => route.params.id as string);
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb>
      <r-breadcrumb :options="ROUTES" />
    </template>

    <div class="layout">
      <item-sidebar />
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.layout {
  display: grid;
  grid-template-columns: 1fr 4fr;
}
</style>
