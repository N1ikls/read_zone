<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui';
import { useAuth } from '../../models';
import type { FormState } from '../../types';
import { z } from 'zod/v3';

const { setUser } = useAuth();

const model = defineModel<FormState>({
  default: () => ({}),
});

const emits = defineEmits<{
  (e: 'close'): void;
}>();

const toast = useToast();

const schema = z.object({
  login: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 8 символов'),
});

const onSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  const { data, status } = await useFetch('/api/auth/registration', {
    method: 'POST',
    body: event.data,
  });

  if (status.value === 'error') {
    toast.add({
      title: 'Неправильный логин или пароль',
      color: 'error',
    });

    return;
  }

  setUser(data.value);
  emits('close');
};
</script>

<template>
  <u-form
    class="modal__form space-y-4"
    :schema="schema"
    :state="model"
    @submit="onSubmit"
  >
    <UFormField
      class="h-23"
      label="Никнейм"
      name="username"
      :ui="{
        label: 'text-[#000000] font-bold text-xl',
        error:
          'text-red-500 text-sm mt-0 transition-all duration-300 ease-in-out',
      }"
    >
      <u-input
        class="w-full rounded-[10px] transition-all duration-300"
        v-model="model.username"
        size="xl"
      />
    </UFormField>

    <UFormField
      class="h-23"
      label="Почта"
      name="login"
      :ui="{
        label: 'text-[#000000] font-bold text-xl',
        error:
          'text-red-500 text-sm mt-0 transition-all duration-300 ease-in-out',
      }"
    >
      <u-input
        class="w-full rounded-[10px] transition-all duration-300"
        v-model="model.login"
        size="xl"
      />
    </UFormField>

    <UFormField
      class="h-23"
      label="Пароль"
      name="password"
      :ui="{
        label: 'text-[#000000] font-bold text-xl',
        error:
          'text-red-500 text-sm mt-0 transition-all duration-300 ease-in-out',
      }"
    >
      <u-input
        class="w-full rounded-[10px] transition-all duration-300"
        v-model="model.password"
        size="xl"
      />
    </UFormField>

    <UFormField name="ok">
      <UCheckbox
        class="checkbox bg-[0862E0]"
        v-model="model.ok"
        color="info"
        size="xl"
        :ui="{
          label: 'text-base font-normal',
        }"
      >
        <template #label>
          Принимаю
          <span class="font-bold"
            >положения и условия политики конфиденциальности</span
          >
        </template>
      </UCheckbox>
    </UFormField>

    <u-button
      class="bg-[#0862E0] font-bold text-[18px] h-10 hover:bg-[#0862E0] text-[#FFFFFF] rounded-[10px] cursor-pointer"
      block
      type="submit"
    >
      Создать аккаунт
    </u-button>
  </u-form>
</template>

<style lang="scss" scoped>
.checkbox {
  span {
    font-weight: 700;
    color: #0862e0;
  }

  :deep(.ant-checkbox-inner) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 25px;
    height: 25px;
  }

  :deep(.ant-checkbox-inner::after) {
    transform: rotate(45deg) scale(1.5) translate(-25%, -50%);
  }
}
</style>
