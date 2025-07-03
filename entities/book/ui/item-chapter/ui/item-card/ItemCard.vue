<script lang="ts" setup>
import { parseISO, format } from 'date-fns';

const { item } = defineProps<{
  item: Record<string, string | number | boolean>;
}>();

const isLiked = ref<boolean>((item.is_liked as boolean) || false);
const countLike = ref<number>((item.likers_count as number) || 0);

const like = async (key: number) => {
  const { data } = await useFetch<number>('/api/chapter/like', {
    method: 'post',
    query: {
      book_id: item.book_id,
      number: key,
    },
  });

  isLiked.value = true;
  countLike.value = data.value || 0;
};
</script>

<template>
  <div
    class="light:bg-[#F5F5F5] rounded-[14px] flex cursor-pointer items-center justify-between !px-4 !py-2"
  >
    <div class="flex items-center gap-4">
      <u-icon
        name="my-icons:eyes-black"
        mode="svg"
      />

      <div class="flex items-center gap-4">Том {{ item.volume || 1 }}</div>

      <div class="flex">
        <span class="cs-text text-md leading-md font-normal text-foreground"
          >Глава {{ item.number }}</span
        >
      </div>
    </div>

    <div class="flex-row flex items-center gap-2">
      <div class="flex items-center gap-2">
        <p
          class="cs-text text-xs leading-xs font-normal text-muted-foreground hidden sm:inline"
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
            name="i-lucide-heart"
            mode="svg"
          />
          {{ countLike }}
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
