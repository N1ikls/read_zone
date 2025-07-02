<script setup lang="ts">
const props = defineProps<{
  value: number;
  max: number;
  votes: string;
  size?: number;
  showLabel?: boolean;
}>();

const getProgressColor = (): string => {
  const colors = {
    5: 'stroke-emerald-500 dark:stroke-emerald-400',
    4: 'stroke-teal-500 dark:stroke-teal-400',
    3: 'stroke-yellow-500 dark:stroke-yellow-400',
    2: 'stroke-orange-500 dark:stroke-orange-400',
    1: 'stroke-red-500 dark:stroke-red-400',
  };
  return 'stroke-blue-500 dark:stroke-blue-400';
};

const actualStrokeWidth = 2;
const actualSize = computed(() => props.size || 60);
const radius = computed(() => actualSize.value / 2 - actualStrokeWidth);
const circumference = computed(() => 2 * Math.PI * radius.value);
const progress = computed(() =>
  props.max > 0 ? (props.value / props.max) * 100 : 0,
);
const strokeDasharray = computed(
  () =>
    `${(progress.value / 100) * circumference.value} ${circumference.value}`,
);
const center = computed(() => actualSize.value / 2);
</script>

<template>
  <div class="relative">
    <svg
      class="h-full w-full"
      :viewBox="`0 0 ${actualSize} ${actualSize}`"
    >
      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="currentColor"
        :stroke-width="actualStrokeWidth"
        class="text-gray-200 dark:text-gray-700"
      />

      <circle
        :cx="center"
        :cy="center"
        :r="radius"
        fill="none"
        stroke="currentColor"
        :stroke-width="actualStrokeWidth"
        :class="getProgressColor()"
        stroke-linecap="round"
        :stroke-dasharray="strokeDasharray"
        :transform="`rotate(-90 ${center} ${center})`"
      />

      <text
        :x="center"
        :y="center - 8"
        text-anchor="middle"
        dominant-baseline="middle"
        class="font-bold fill-gray-800 dark:fill-gray-200"
      >
        {{ value.toFixed(1) }}
      </text>

      <text
        :x="center"
        :y="center + 15"
        text-anchor="middle"
        dominant-baseline="middle"
        class="text-[5px] font-medium fill-gray-800 dark:fill-gray-200"
      >
        {{ votes }}
      </text>
    </svg>

    <div class="absolute top-[58%] right-[25%]">
      <nuxt-rating
        class="rating"
        inline
        read-only
        :border-width="1.5"
        :rounded-corners="true"
        border-color="#0862E0"
        :rating-content="[
          10.937, 1.593, 12.927, 5.813, 13.377, 6.063, 17.837, 6.743, 17.707,
          6.873, 14.477, 10.163, 14.227, 10.613, 15.007, 15.073, 14.877, 15.203,
          10.937, 13.203, 10.937, 13.203, 6.997, 15.203, 6.867, 15.073, 7.647,
          10.613, 7.397, 10.163, 4.167, 6.873, 4.037, 6.743, 8.497, 6.063,
          8.947, 5.813, 10.937, 1.593,
        ]"
        inactive-color="#E8E8E8"
        :rating-size="16"
        :rating-value="value"
        active-color="#0862E0"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rating {
  :deep(polygon) {
    stroke-linecap: round;
    stroke-linejoin: round;
  }
}
</style>
