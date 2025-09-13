<script lang="ts" setup>
import { ItemsCard } from '@/entities/catalog';
import type { Team, TeamBooksApiResponse } from '@/shared/types';

const {} = defineProps<{}>();

const route = useRoute();
const teamId = computed(() => route.params?.id);

const queries = useGetRouteQuery({
  page: 1,
  limit: 10,
  name: null,
});

const { data } = useFetch<TeamBooksApiResponse>(
  computed(() => `/api/teams/${teamId.value}/books`),
  {
    method: 'get',
    query: queries,
  },
);

const catalogData = computed(() => ({
  items: data.value?.items?.books || [],
  total: data.value?.items?.total || 0,
  page: data.value?.items?.page || 1,
  limit: data.value?.items?.limit || 10,
}));
</script>

<template>
  <div class="work mt-4">
    <pre>
      {{ data }}
    </pre>

    <ItemsCard
      :data="catalogData"
      :queries="queries"
    />
  </div>
</template>
