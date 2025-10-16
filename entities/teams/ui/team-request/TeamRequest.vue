<script lang="ts" setup>
import type { ApplicationsResponse } from '../../types';
import { TABS } from './consts';
import { ItemCompleted, ItemRequest } from './ui';
const route = useRoute();

const setRouteQueries = useSetRouteQuery();
const queries = useGetRouteQuery({
  status: 'all',
});

const active = ref('active');
const guid = computed(() => route.params.id as string);

const { data, refresh } = useFetch<ApplicationsResponse>(
  computed(() => `/api/teams/${guid.value}/applications`),
  {
    method: 'get',
    query: queries,
  },
);

const applications = computed(() => data.value?.data.applications ?? []);
</script>

<template>
  <div class="mt-[30px] w-full h-full">
    <div class="mt-[16px]">
      <u-tabs
        v-model="active"
        color="secondary"
        :items="TABS"
        unmount-on-hide
        :ui="{
          root: 'gap-4',
          list: 'rounded-full light:bg-[#F5F5F5] overflow-x-scroll',
          indicator: 'rounded-full bg-[#D6D6D6]',
          trigger: 'min-w-[auto] ',
        }"
      >
        <template #active>
          <ItemRequest
            :items="applications"
            @refresh="refresh"
          />
        </template>

        <template #completed>
          <ItemCompleted :items="applications" />
        </template>
      </u-tabs>
    </div>
  </div>
</template>
