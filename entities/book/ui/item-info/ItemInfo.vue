<script lang="ts" setup>
import numeral from 'numeral';
import type { Book } from '~/shared/types';
import { RATINGS } from '../../consts';
import type { RateCounts } from '~/shared/types/common';
import { ItemRate } from '@/entities/book';

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
  <div
    class="light:bg-[#F5F5F5] dark:bg-[#012053] rounded-[10px] grid gap-3 p-4"
  >
    <div class="cs-text text-xl leading-lg text-foreground leading-[1.25]">
      Описание манги
    </div>

    <div class="grid gap-1">
      <div
        class="relative overflow-hidden"
        :class="{ 'max-h-[120px]': !isHiddenDescription }"
      >
        <div
          class="text-[16px]"
          style="overflow-wrap: anywhere; word-break: break-word"
        >
          <p>{{ item.description }}</p>
        </div>
      </div>

      <u-button
        color="info"
        variant="link"
        class="cs-text p-0 light:text-[#0862e0] text-sm leading-sm font-normal cursor-pointer underline-offset-4"
        @click="isHiddenDescription = !isHiddenDescription"
      >
        {{ isHiddenDescription ? 'Скрыть' : 'Больше' }}
      </u-button>
    </div>

    <div class="">
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

    <div class="">
      <div class="cs-text text-xl leading-lg text-foreground leading-[1.25]">
        Создатели
      </div>

      <p>{{ item?.author_name }}</p>
    </div>

    <div class="">
      <div class="cs-text text-xl leading-lg text-foreground leading-[1.25]">
        Переводчики
      </div>

      <p>{{ item?.translator_name }}</p>
    </div>
  </div>

  <u-button
    v-if="item.is_writeable"
    color="info"
    class="my-4 text-[16px] font-bold rounded-[10px]"
    block
    :to="`/book/${item.id}/edit`"
  >
    Редактировать
  </u-button>

  <div class="light:bg-[#F5F5F5] rounded-[10px] p-4 my-4">
    <span class="text-[20px] font-bold"> Подписки </span>
  </div>

  <div class="rounded-[10px] p-4">
    <span class="text-[20px] font-bold"> Рейтинг </span>

    <div
      class="mt-4 grid grid-cols-1 md:grid-cols-1 xl:grid-cols-[190px_1fr] items-center justify-between w-full gap-3"
    >
      <r-progress
        class="flex justify-center"
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
          <span class="font-normal text-xs md:text-sm xl:text-base">{{
            rates.label
          }}</span>

          <div class="flex col-span-2 items-center gap-4">
            <UProgress
              class="w-full"
              :ui="{
                base: 'light:bg-[#F2F2F2] dark:bg-[#003386]',
                indicator: 'light:bg-[#3881F6] dark:bg-[#3881F6]',
              }"
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

  <item-rate :guid="item.id" />
</template>

<style lang="scss" scoped>
.shadow {
  box-shadow: 0 2px 8px 0 rgba(60, 60, 60, 0.25);
}
</style>
