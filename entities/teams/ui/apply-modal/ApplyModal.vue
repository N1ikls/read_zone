<script setup lang="ts">
import type { FormError, FormSubmitEvent } from '@nuxt/ui';
import type { FormApplyType } from '../../types';

const { guid } = defineProps<{
  guid: string;
  name: string;
}>();

const toast = useToast();
const open = ref(false);

const state = reactive<FormApplyType>({
  reason: undefined,
});

const validate = (state: FormApplyType): FormError[] => {
  const errors = [];

  if (!state.reason)
    errors.push({ name: 'reason', message: 'Обязательно для заполнения' });

  return errors;
};

const onSubmit = async (event: FormSubmitEvent<FormApplyType>) => {
  try {
    await $fetch(`/api/teams/${guid}/applications/create`, {
      method: 'POST',
      body: {
        message: event.data.reason,
      },
    });

    toast.add({ title: 'Заявка в команду подана успешно' });
  } catch (e) {
    toast.add({ title: 'Ошибка при обработке' });
  } finally {
    open.value = false;
  }
};
</script>

<template>
  <u-modal
    v-model:open="open"
    :ui="{
      content:
        'grid gap-5 rounded-[15px] p-6  max-w-[752px] dark:bg-[var(--bg)] divide-y-0',
    }"
  >
    <u-button
      class="font-bold"
      color="info"
      variant="outline"
      block
      size="xl"
      @click="open = true"
    >
      Подать заявку
    </u-button>

    <template #content>
      <div class="font-bold text-[20px]">
        Заявка на вступление в команду {{ name }}
      </div>

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
          <UTextarea
            color="info"
            class="w-full text-[#999999]"
            placeholder="Возьмите в команду, пожалуйста, будьте добры."
            v-model="state.reason"
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
            Закрыть
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
