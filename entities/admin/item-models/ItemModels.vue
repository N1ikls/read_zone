<script lang="ts" setup>
import { TableGenres, TableTeams } from './ui';
import { TABS } from './consts';

const active = ref('genres');
</script>

<template>
  <u-tabs
    v-model="active"
    color="secondary"
    :items="TABS"
    :ui="{
      root: 'gap-4',
      list: 'rounded-full light:bg-[#F5F5F5] overflow-x-scroll',
      indicator: 'rounded-full bg-[#D6D6D6]',
      trigger: 'min-w-[auto] ',
    }"
  >
    <template #genres>
      <table-genres />
    </template>

    <template #teams>
      <table-teams />
    </template>
  </u-tabs>
</template>
