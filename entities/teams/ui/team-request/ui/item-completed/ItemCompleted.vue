<script setup lang="ts">
import type { Application } from '../../../../types';
import { format, parseISO } from 'date-fns';
import { statusLabels } from '../../../../types';

const { items = [] } = defineProps<{
  items: Application[];
}>();

const normalized = computed(() =>
  items.filter((item) => item.status !== 'pending'),
);
</script>

<template>
  <div
    v-if="normalized.length"
    class="light:bg-[#F5F5F5] p-6 rounded-[10px]"
  >
    <div class="overflow-x-auto md:overflow-x-visible">
      <div class="min-w-[600px] md:min-w-0 grid grid-cols-3">
        <template
          v-for="(item, index) in normalized"
          :key="index"
        >
          <div class="flex items-center gap-2">
            <UAvatar
              :src="item.user_avatar || '/test_avatar.png'"
              class="size-12"
            />

            <div class="flex flex-col gap-1">
              <div class="flex items-center gap-2">
                <p class="text-base cs-text leading-xs font-bold">
                  {{ item.user_name }}
                </p>

                <p
                  class="text-[16px] text-[#7B7B7B]"
                  :class="{ 'text-[#0862E0]': item.status === 'approved' }"
                >
                  {{ statusLabels[item.status] }}
                </p>
              </div>
              <p class="cs-text leading-xs text-xs font-normal">
                {{ format(parseISO(item.created_at), 'dd.MM.yyyy') }}
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>

  <div
    v-else
    class="relative flex flex-col items-center justify-center gap-4 rounded-lg p-4 sm:p-6 lg:p-8 min-w-0 bg-default ring ring-default"
  >
    <div class="flex flex-col items-center gap-2 max-w-sm text-center">
      Пусто
    </div>
  </div>
</template>
