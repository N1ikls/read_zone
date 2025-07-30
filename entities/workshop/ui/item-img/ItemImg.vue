<script lang="ts" setup>
import type { Book } from '~/shared/types';

const { item } = defineProps<{
  item: Book;
}>();
</script>

<template>
  <div class="rounded-[15px] flex flex-col gap-4">
    <span
      class="inline-flex shrink-0 relative w-full overflow-hidden rounded-[15px] select-none aspect-[1]"
    >
      <nuxt-img
        class="w-full h-full object-cover"
        :src="item?.background"
      />

      <div
        class="cs-text flex flex-nowrap justify-between items-center w-full px-4 gap-1 select-none absolute bottom-0 rounded-full lg:rounded-[15px] xl:rounded-[15px] actions lg:h-[73px] xl:h-[73px] h-[35px]"
      >
        <p
          class="font-bold text-2xl leading-none text-[#FFFFFF] text-ellipsis line-clamp-1"
        >
          {{ item.name }}
        </p>

        <div class="flex flex-nowrap items-center gap-1">
          <u-icon
            class="text-[#FDCA24] size-5"
            mode="svg"
            name="my-icons:rate"
          />

          <p class="text-[22px] text-[#FFFFFF] font-semibold leading-none">
            {{ item.rate?.toFixed(2) }}
          </p>
        </div>
      </div>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.actions {
  background: #00000003;
  backdrop-filter: blur(4px);
}
</style>
