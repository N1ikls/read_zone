<script setup lang="ts">
const open = defineModel<boolean>({
  default: false,
});

const router = useRouter();
const my18 = useCookie<boolean>('my-18', {
  default: () => false,
});

const isShow = ref(false);

const onUpdate = () => {
  if (isShow.value) my18.value = true;
  open.value = false;
};

const onClose = () => {
  isShow.value = false;
  open.value = false;
  router.push('/');
};
</script>

<template>
  <u-modal
    v-model:open="open"
    :dismissible="false"
    :ui="{
      content:
        'grid gap-5 rounded-[15px] p-5 max-w-[320px] dark:bg-[var(--bg)] divide-y-0',
    }"
  >
    <template #content>
      <div class="font-bold text-[26px]">Предупреждение</div>
      <div class="grid gap-2">
        <div class="text-[16px]">
          Эта страница содержит материал с возрастным ограничением
          <span class="font-bold text-[#E00808]">18+</span>
        </div>

        <div class="text-[16px]">
          При просмотре содержимого, вы подтверждаете, что вас есть
          <span class="font-bold text-[#E00808]">18 лет</span>
        </div>

        <UCheckbox
          label="Больше не показывать"
          v-model="isShow"
          :ui="{
            root: 'flex items-center',
            label: 'text-[#7B7B7B] text-xs',
          }"
        />
      </div>

      <div class="flex items-center gap-2">
        <u-button
          color="secondary"
          class="rounded-[10px] text-highlighted"
          block
          @click="onClose"
          >Назад</u-button
        >
        <u-button
          size="lg"
          class="rounded-[10px] bg-[#F0DDDD] hover:bg-[none] font-semibold text-[#E00808]"
          block
          @click="onUpdate"
          >Мне есть 18+</u-button
        >
      </div>
    </template>
  </u-modal>
</template>
