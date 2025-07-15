<script lang="ts" setup>
import { Doughnut } from 'vue-chartjs';
import type { ChartData, ChartOptions } from 'chart.js';

defineProps<{
  amount: string;
  description: string;
  type: string;
  data: ChartData<'doughnut'>;
  options: any;
}>();
</script>

<template>
  <div class="ring-1 p-6 rounded-[10px] ring-[#E0E0E0]">
    <div class="flex justify-between ml-[15px]">
      <div class="grid gap-2">
        <p class="font-bold text-[32px] cs-text leading-none">{{ amount }}</p>
        <p class="text-[#999999] cs-text leading-none font-normal">
          {{ description }}
        </p>
      </div>
      <p class="text-[20px] cs-text leading-none font-normal">{{ type }}</p>
    </div>
    <div class="flex items-center">
      <doughnut
        :data="data"
        :options="options"
      >
        dsada
      </doughnut>
    </div>
  </div>
</template>
