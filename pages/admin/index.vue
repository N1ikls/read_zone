<script setup lang="ts">
import { ItemChart, ItemModels } from '@/entities/admin';
import { ROUTES, TABS } from './consts';

definePageMeta({
  middleware: ['admin'],
});

const route = useRoute();
const router = useRouter();

const active = computed({
  get() {
    return (route.query.tab as string) || 'chart';
  },
  set(tab: string) {
    router.push({
      query: {
        ...route.query,
        tab: tab ?? undefined,
      },
    });
  },
});
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb> <r-breadcrumb :options="ROUTES" /> </template>

    <template #title> Панель администратора </template>

    <u-tabs
      v-model="active"
      color="info"
      :items="TABS"
      :ui="{
        root: 'gap-4',
        list: 'rounded-full light:bg-[#F5F5F5] overflow-x-scroll  h-9  shadow inset-shadow-2xs',
        indicator: 'rounded-full',
        trigger: 'min-w-[auto]',
      }"
    >
      <template #chart>
        <item-chart />
      </template>
      <template #models>
        <item-models />
      </template>
    </u-tabs>
  </NuxtLayout>
</template>
