<script lang="ts" setup>
import numeral from 'numeral';
import type { Book } from '~/shared/types';
import { RATINGS } from '../../consts';
import type { RateCounts } from '~/shared/types/common';

const { item } = defineProps<{
  item: Book;
}>();

const { data: tags } = await useFetch('/api/tag', {
  method: 'get',
  query: { book_id: item.id },
});

const isHiddenDescription = ref(false);

const rate = (stars: number) =>
  item?.rate_counts?.[stars as unknown as keyof RateCounts] || 0;

const totalVotes = computed(() => {
  if (!item?.rate_counts) return 0;

  return Object.values(item.rate_counts).reduce((sum, count) => {
    return sum + (count || 0);
  }, 0);
});
</script>

<template>
  <div class="light:bg-[#F5F5F5] rounded-[10px] p-4">
    <div
      class="cs-text text-lg leading-lg font-semibold text-foreground leading-[1.25] mb-3"
    >
      Описание манги
    </div>

    <div
      class="relative overflow-hidden"
      :class="{ 'max-h-[120px]': !isHiddenDescription }"
    >
      <div class="text-[16px] whitespace-pre-wrap">
        <p>dsadas</p>
      </div>
    </div>

    <u-button
      color="info"
      variant="link"
      class="cs-text p-0 light:text-[#0862e0] text-sm leading-sm font-normal cursor-pointer underline-offset-4 mb-3"
      @click="isHiddenDescription = !isHiddenDescription"
    >
      {{ isHiddenDescription ? 'Скрыть' : 'Больше' }}
    </u-button>

    <div class="mb-3">
      <span class="mb-3">Теги</span>

      <div
        class="cs-text text-sm font-normal text-foreground cs-layout-stats-line-item-content flex flex-wrap gap-2"
      >
        <p
          v-for="tag in tags"
          class="font-semibold py-0.5 text-xs text-info"
        >
          #{{ tag.name }}
        </p>
      </div>
    </div>

    <div class="mb-3">
      <div
        class="cs-text text-lg leading-lg font-semibold text-foreground leading-[1.25]"
      >
        Создатели
      </div>

      <p>{{ item?.author_name }}</p>
    </div>

    <div class="mb-3">
      <div
        class="cs-text text-lg leading-lg font-semibold text-foreground leading-[1.25]"
      >
        Переводчики
      </div>

      <p>{{ item?.translator_name }}</p>
    </div>

    <div class="flex flex-col gap-2">
      <span
        class="cs-text text-lg leading-lg font-semibold text-foreground leading-[1.25]"
      >
        Альтернативные названия
      </span>
      <div class="flex items-center gap-3">
        {{ item.alt_name }}
      </div>
    </div>
  </div>

  <div class="light:bg-[#F5F5F5] rounded-[10px] p-4 my-4">
    <span class="text-[20px] font-bold"> Подписки </span>
  </div>

  <div class="light:bg-[#F5F5F5] rounded-[10px] p-4">
    <span class="text-[20px] font-bold"> Рейтинг </span>

    <div
      class="mt-4 grid md:grid-cols-1 xl:grid-cols-[190px_1fr] items-center justify-between w-full gap-3"
    >
      <r-progress
        :value="Number(item?.rate || 0)"
        :max="totalVotes"
        :votes="String(totalVotes)"
      />

      <div class="grid items-center grid-cols-1 gap-2">
        <div
          v-for="(rates, index) in RATINGS"
          :key="index"
          class="grid grid-cols-3"
        >
          <span class="font-normal">{{ rates.label }}</span>

          <div class="flex col-span-2 items-center gap-4">
            <UProgress
              color="info"
              class="w-full"
              :modelValue="rate(rates.stars)"
              :max="totalVotes"
            />

            <span class="text-muted-foreground font-semibold text-sm">
              {{ numeral(rate(rates.stars)).format('0.[0]a').toUpperCase() }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.shadow {
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.25);
}
</style>
