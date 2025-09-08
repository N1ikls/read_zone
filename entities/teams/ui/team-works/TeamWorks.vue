<script lang="ts" setup>
import { ItemsCard } from '@/entities/catalog';

const { item = {} } = defineProps<{
  item: object;
}>();

const route = useRoute();
const setRouteQueries = useSetRouteQuery();
const queries = useGetRouteQuery({
  page: 1,
  limit: 10,
});
</script>

<template>
  <div class="work mt-4">
    <ItemsCard
      :data="{ items: item?.books || [], total: item?.total }"
      :queries="queries"
    />
  </div>
</template>
