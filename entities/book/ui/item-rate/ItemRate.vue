<script lang="ts" setup>
const { guid } = defineProps<{
  guid: string;
}>();

const { isAuth } = useAuthToast();

const open = ref<boolean>(false);

const onRate = async (rating: number) => {
  await $fetch('/api/book/rate', {
    method: 'POST',
    query: { value: rating, book_id: guid },
  });

  open.value = false;
};
</script>

<template>
  <UModal v-model:open="open">
    <u-button
      color="info"
      class="px-2 min-w-[20px] text-xs rounded-full h-[20px]"
      @click="isAuth() ? (open = true) : (open = false)"
    >
      Оценить
    </u-button>

    <template #content>
      <div class="h-[150px] p-4 flex flex-col gap-2">
        <div class="font-bold text-[24px]">Оценка тайтла</div>

        <div class="light:bg-[#F5F5F5] rounded-[10px] h-40">
          <div class="flex flex gap-4 items-center justify-center h-full">
            <u-button
              color="info"
              class="cs-button z-0 cursor-pointer group relative inline-flex items-center justify-center box-border appearance-none select-none whitespace-nowrap subpixel-antialiased transition-all tap-highlight-transparent transform-gpu data-[pressed=true]:scale-[0.97] outline-none focus-visible:outline-hidden ring-0 rounded-full h-11 min-w11 text-sm px-0 aspect-square font-bold hover:scale-[1.125]"
              v-for="n in 5"
              @click="onRate(n)"
            >
              {{ n }}
            </u-button>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>
