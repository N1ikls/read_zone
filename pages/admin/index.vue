<script setup lang="ts">
import {
  ItemChart,
  ItemModels,
  TableBlocked,
  TableBan,
  TableRoles,
  TableComplaints,
  TableShadowWork,
} from '@/entities/admin';
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
        list: 'light:bg-[#F5F5F5] overflow-x-scroll  ',
        indicator: '',
        trigger: 'min-w-[auto]',
      }"
    >
      <template #chart>
        <item-chart />
      </template>
      <template #models>
        <item-models />
      </template>
      <template #banList>
        <table-blocked />
      </template>
      <template #ban>
        <table-ban />
      </template>
      <template #listOfComplaints>
        <table-complaints />
      </template>
      <template #roles>
        <table-roles />
      </template>
      <template #shadowWork>
        <table-shadow-work />
      </template>
    </u-tabs>
  </NuxtLayout>
</template>
