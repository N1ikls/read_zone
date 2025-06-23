<script lang="ts" setup>
defineProps<{
  page: number;
  total: number;
  limit: number;
}>();

const emits = defineEmits<{
  (e: 'updatePage', v: number): void;
}>();
</script>

<template>
  <UPagination
    show-edges
    :page="page"
    :total="total"
    :items-per-page="limit"
    @update:page="(v) => emits('updatePage', v)"
  />
</template>
