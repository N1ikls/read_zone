<script lang="ts" setup>
import { parseISO, format } from 'date-fns';
import type { Chapter } from '~/shared/types';

const { item } = defineProps<{
  item: Chapter;
}>();

const { isAuth } = useAuthToast();

const isLiked = ref<boolean>((item.is_liked as boolean) || false);
const countLike = ref<number>((item.likers_count as number) || 0);

const like = async (key: number) => {
  if (!isAuth()) return;

  if (isLiked.value) return;

  const data: number = await $fetch('/api/chapter/like', {
    method: 'post',
    query: {
      book_id: item.book_id,
      number: key,
    },
  });

  isLiked.value = true;
  countLike.value = data || 0;
};
</script>

<template>
  <div class="flex cursor-pointer items-center justify-between !px-4 !py-1">
    <div class="flex items-center gap-2">
      <u-icon
        class="text-[18px]"
        name="my-icons:eyes"
        mode="svg"
      />

      <div class="flex items-center font-bold gap-4">
        {{ item.volume || 1 }} Глава {{ item.number }}
      </div>

      <div
        v-if="!item.is_public"
        class="text-[22px]"
      >
        <u-icon
          class="text-[#0862E0]"
          name="my-icons:lock"
          mode="svg"
        />
      </div>
    </div>

    <div class="flex-row flex items-center gap-2">
      <div class="flex items-center gap-2">
        <p
          class="cs-text text-[15px] leading-xs font-semibold hidden sm:inline"
        >
          {{ format(parseISO(item.created_at as string), 'dd.MM.yyyy') }}
        </p>
      </div>

      <div class="ml-2 flex items-center justify-between gap-2">
        <u-button
          class="cs-button z-0 cursor-pointer group relative items-center box-border appearance-none whitespace-nowrap font-medium subpixel-antialiased transition-all tap-highlight-transparent transform-gpu data-[pressed=true]:scale-[0.97] opacity-100 outline-none focus-visible:outline-hidden ring-0 rounded-full h-7 text-sm bg-[none] dark:bg-[#003386] text-secondary-foreground hover:bg-[#ffffff] 0 ml-2 flex gap-2 select-none"
          @click.stop.prevent="like(item.number as number)"
        >
          <u-icon
            :class="{ 'text-red-700 is-liked': isLiked }"
            class="text-[22px]"
            name="i-lucide-heart"
            mode="svg"
          />
          <span class="text-base">
            {{ countLike }}
          </span>
        </u-button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.is-liked {
  :deep(path) {
    fill: var(--color-red-700);
  }
}
</style>
