<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

import { DATA, OPTIONS } from '../consts';

ChartJS.register(ArcElement, Tooltip, Legend);
</script>

<template>
  <ClientOnly>
    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <RDoughnut
        amount="100 000 ₽"
        description="Заработано"
        type="Доходы"
        :data="DATA"
        :options="OPTIONS"
      />

      <RDoughnut
        amount="30 000 ₽"
        description="Потрачено"
        type="Расходы"
        :data="DATA"
        :options="OPTIONS"
      />
    </div>

    <template #fallback>
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <USkeleton class="h-[404px] rounded-[10px]" />
        <USkeleton class="h-[404px] rounded-[10px]" />
      </div>
    </template>
  </ClientOnly>
</template>
