<script setup lang="ts">
const value = ref(null);
const open = ref<boolean>(false);

const onClose = () => {
  open.value = false;
  value.value = null;
};

const onRequest = () => {
  onClose();
};
</script>

<template>
  <u-modal
    v-model:open="open"
    :dismissible="false"
    :ui="{
      content:
        'grid gap-5 rounded-[15px] p-5 max-w-[750px] dark:bg-[var(--bg)] divide-y-0',
    }"
  >
    <u-button
      class="font-bold"
      color="info"
      variant="outline"
      block
      size="xl"
    >
      Подать заявку
    </u-button>

    <template #content>
      <div class="font-bold text-[20px]">
        Заявка на вступление в команду Название команды
      </div>

      <div class="grid gap-2">
        <label class="text-[16px] text-[#5E5E5E]">Причина</label>

        <UTextarea
          v-model="value"
          color="secondary"
          placeholder="Возьмите в команду, пожалуйста, будьте добры."
        />
      </div>

      <div class="flex items-center gap-2">
        <u-button
          color="info"
          variant="outline"
          class="rounded-[10px] text-highlighted"
          block
          @click="onClose"
        >
          Закрыть
        </u-button>

        <u-button
          size="lg"
          color="info"
          class="rounded-[10px] font-bold"
          block
          @click="onRequest"
        >
          Отправить
        </u-button>
      </div>
    </template>
  </u-modal>
</template>
