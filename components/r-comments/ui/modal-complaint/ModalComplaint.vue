<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui';
import type { FormReportType } from '../../types';

const emits = defineEmits<{
  report: [v: FormReportType];
}>();

const open = ref(false);

const state = reactive<FormReportType>({
  reason: undefined,
  comment: undefined,
});

const validate = (state: FormReportType): FormError[] => {
  const errors = [];

  if (!state.reason)
    errors.push({ name: 'reason', message: 'Обязательно для заполнения' });

  return errors;
};

const options = computed(() => [
  {
    label: 'Пожаловаться',
    slot: 'report' as const,
    onSelect: () => {
      open.value = true;
    },
  },
]);

async function onSubmit(event: FormSubmitEvent<FormReportType>) {
  emits('report', event.data);
  open.value = false;
}
</script>

<template>
  <u-modal
    v-model:open="open"
    :ui="{
      content:
        'grid gap-5 rounded-[15px] p-6  max-w-[752px] dark:bg-[var(--bg)] divide-y-0',
    }"
  >
    <UDropdownMenu :items="options">
      <u-button
        size="sm"
        icon="my-icons:more"
        color="info"
        variant="ghost"
      />
    </UDropdownMenu>

    <template #content>
      <div class="font-bold text-[32px]">Отправить жалобу</div>

      <UForm
        :validate="validate"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Причина"
          name="reason"
        >
          <UInput
            color="info"
            placeholder="Плагиат/ нарушение прав сайта/  несоответсвие жанров"
            class="w-full"
            v-model="state.reason"
          />
        </UFormField>

        <UFormField
          label="Комментарий"
          name="comment"
        >
          <UTextarea
            color="info"
            class="w-full text-[#999999]"
            placeholder="Оставить комментарий..."
            v-model="state.comment"
          />
        </UFormField>

        <div class="flex items-center gap-2">
          <u-button
            color="info"
            variant="outline"
            size="lg"
            block
            @click="open = false"
          >
            Отмена
          </u-button>

          <u-button
            type="submit"
            color="info"
            size="lg"
            block
          >
            Отправить
          </u-button>
        </div>
      </UForm>
    </template>
  </u-modal>
</template>
