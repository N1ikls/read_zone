<script setup lang="ts">
import type { Book } from '~/shared/types';

const { item, isNew = false } = defineProps<{
  item: Book;
  isNew?: boolean;
}>();
</script>

<template>
  <div class="relative rounded-[12px] overflow-hidden bg-[#E7F0FF]">
    <!-- Бейдж New -->
    <div
      v-if="isNew"
      class="absolute left-2 top-2 z-10 px-2 py-[2px] text-[12px] font-bold rounded-[10px] bg-[#0862E0] text-white shadow"
    >
      New
    </div>

    <!-- Обложка -->
    <nuxt-img
      :src="item.background || '/test_banner_2.png'"
      class="w-full h-full object-cover aspect-[2/3]"
      :alt="item.name"
    />

    <!-- Нижняя плашка -->
    <div class="absolute left-0 right-0 bottom-0 px-4 pb-3 pt-2">
      <div
        class="w-full rounded-[12px] h-[64px] flex items-center justify-between px-3"
        style="background: linear-gradient(180deg, #65a4ff 0%, #b7d4ff 100%)"
      >
        <div class="flex items-center -space-x-2">
          <nuxt-img
            v-for="n in 3"
            :key="n"
            :src="item.background || '/test_banner_2.png'"
            class="w-10 h-10 rounded-full ring-2 ring-white object-cover"
          />
        </div>

        <div class="text-[#0A0A0A] font-bold text-[18px]">
          Работы: {{ item.chapters_count }}
        </div>
      </div>
    </div>
  </div>
</template>
