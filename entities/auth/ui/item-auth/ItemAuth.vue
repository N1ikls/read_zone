<script lang="ts" setup>
import type { FormSubmitEvent } from '@nuxt/ui';
import { useAuth } from '../../models';
import type { FormState } from '../../types';
import { z } from 'zod/v3';

const { setUser } = useAuth();

const emits = defineEmits<{
  (e: 'registration', v: true): void;
  (e: 'close'): void;
}>();

const toast = useToast();

const model = defineModel<FormState>({
  default: () => ({}),
});

const show = ref(false);

const schema = z.object({
  login: z.string().email('Введите корректный email'),
  password: z.string().min(6, 'Пароль должен содержать минимум 8 символов'),
});

const onSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  const { data, status } = await useFetch('/api/auth/login', {
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
  <div class="logo">
    <u-icon name="my-icons:auth-logo" />

    <div class="logo__title">
      Добро пожаловать!

      <div class="logo__title-text">Чувствуйте себя как дома</div>
    </div>
  </div>

  <u-form
    class="modal__form space-y-4"
    :schema="schema"
    :state="model"
    @submit="onSubmit"
  >
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
        :type="show ? 'text' : 'password'"
        :ui="{ trailing: 'pe-1' }"
      >
        <template #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="show ? 'Hide password' : 'Show password'"
            :aria-pressed="show"
            aria-controls="password"
            @click="show = !show"
          />
        </template>
      </u-input>
    </UFormField>

    <u-button
      class="bg-[#0862E0] font-bold text-[18px] h-10 hover:bg-[#0862E0] text-[#FFFFFF] rounded-[10px] cursor-pointer"
      block
      type="submit"
    >
      Войти
    </u-button>

    <div class="text-[15px] text-[#000000]">
      Нет аккаунта на нашем портале?
      <span
        class="text-[#0862E0] font-semibold"
        @click="emits('registration', true)"
        >Зарегестрироваться</span
      >
    </div>

    <div class="text-[15px] text-[#000000]">
      Забыли пароль?
      <span class="text-[#0862E0] font-semibold">Восстановить</span>
    </div>
  </u-form>
</template>

<style lang="scss" scoped>
.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding-bottom: 25px;

  span {
    width: 100px;
    height: 100px;
    line-height: 100px;
    font-size: 50px;
  }

  &__title {
    font-weight: 700;
    font-size: 20px;

    &-text {
      font-size: 15px;
      font-weight: 400;
    }
  }
}

.text-small {
  margin-top: 8px;
  font-size: 15px;
  font-weight: 400;

  span {
    cursor: pointer;
    font-weight: 600;
    color: #0862e0;
  }
}
.modal {
  &__wrapper {
    padding: 0 40px;

    padding-bottom: 162px;
  }

  &__title {
    text-align: center;
  }
  h1 {
    color: #000000;
  }

  &__form {
    padding: 25px 40px;
    background-color: #f5f5f5;
    border-radius: 10px;

    &:deep(.ant-form-item-required) {
      font-size: 20px;
      font-weight: 700;
      color: #000000;
    }
  }
}

.checkbox {
  font-size: 16px;
  font-weight: 400;

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

.button {
  height: 42px;
  font-size: 18px;
  font-weight: 700;
}
</style>
