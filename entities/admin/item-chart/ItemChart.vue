<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { OPTIONS } from '../consts';

ChartJS.register(ArcElement, Tooltip, Legend);

// Получаем статистику с сервера
const { data: stats, pending, error } = await useFetch('/api/admin/stats');

// Данные для диаграммы доходов
const revenueData = computed(() => ({
  labels: ['Главы', 'Донаты', 'Подписки'],
  datasets: [
    {
      backgroundColor: ['#EF9B15', '#18BDDA', '#129558'],
      data: [
        stats.value?.revenue?.chapters || 0,
        stats.value?.revenue?.donations || 0,
        stats.value?.revenue?.subscriptions || 0,
      ],
      borderRadius: 0,
      borderWidth: 0,
      radius: '85%',
      offset: 0,
      cutout: '75%',
      spacing: 0,
    },
  ],
}));

// Данные для диаграммы расходов
const expensesData = computed(() => ({
  labels: ['Реклама', 'Серверы', 'Прочее'],
  datasets: [
    {
      backgroundColor: ['#E75023', '#FF6B35', '#F7931E'],
      data: [
        stats.value.expenses.advertising || 0,
        stats.value.expenses.server || 0,
        stats.value.expenses.other || 0,
      ],
      borderRadius: 0,
      borderWidth: 0,
      radius: '85%',
      offset: 0,
      cutout: '75%',
      spacing: 0,
    },
  ],
}));

// Форматирование суммы
const formatAmount = (amount: number) => {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
  }).format(amount);
};

const totalRevenue = computed(() => {
  if (!stats.value?.revenue) return formatAmount(0);
  const total =
    stats.value.revenue.chapters +
    stats.value.revenue.donations +
    stats.value.revenue.subscriptions;
  return formatAmount(total);
});

const totalExpenses = computed(() => {
  if (!stats.value?.expenses) return formatAmount(0);
  const total =
    stats.value.expenses.advertising +
    (stats.value.expenses.server || 0) +
    (stats.value.expenses.other || 0);
  return formatAmount(total);
});
</script>

<template>
  <ClientOnly>
    <div
      v-if="pending"
      class="grid grid-cols-1 xl:grid-cols-2 gap-4"
    >
      <USkeleton class="h-[404px] rounded-[10px]" />
      <USkeleton class="h-[404px] rounded-[10px]" />
    </div>

    <div
      v-else-if="error"
      class="text-center p-8"
    >
      <p class="text-red-500">Ошибка загрузки статистики</p>
    </div>

    <div
      v-else
      class="space-y-6"
    >
      <!-- Основная статистика согласно ТЗ -->
      <div class="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div class="bg-white rounded-lg p-4 shadow">
          <h3 class="text-sm text-gray-600">Всего посетителей</h3>
          <p class="text-2xl font-bold">{{ stats?.uniqueVisitors || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow">
          <h3 class="text-sm text-gray-600">Зарегистрированных</h3>
          <p class="text-2xl font-bold">{{ stats?.totalUsers || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow">
          <h3 class="text-sm text-gray-600">Книг</h3>
          <p class="text-2xl font-bold">{{ stats?.totalBooks || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow">
          <h3 class="text-sm text-gray-600">Глав</h3>
          <p class="text-2xl font-bold">{{ stats?.totalChapters || 0 }}</p>
        </div>
        <div class="bg-white rounded-lg p-4 shadow">
          <h3 class="text-sm text-gray-600">Команд</h3>
          <p class="text-2xl font-bold">{{ stats?.totalTeams || 0 }}</p>
        </div>
      </div>

      <!-- Диаграммы доходов и расходов -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RDoughnut
          :amount="totalRevenue"
          description="Заработано"
          type="Доходы"
          :data="revenueData"
          :options="OPTIONS"
        />

        <RDoughnut
          :amount="totalExpenses"
          description="Потрачено"
          type="Расходы"
          :data="expensesData"
          :options="OPTIONS"
        />
      </div>
    </div>

    <template #fallback>
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <USkeleton class="h-[404px] rounded-[10px]" />
        <USkeleton class="h-[404px] rounded-[10px]" />
      </div>
    </template>
  </ClientOnly>
</template>
