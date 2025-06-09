<script lang="ts" setup>
import type { FormState } from '../../types';

const { setData } = useLocalData();

const emits = defineEmits<{
  (e: 'registration', v: true): void;
  (e: 'close'): void;
}>();

const model = defineModel<FormState>({
  default: () => ({}),
});

const onFinish = async (values: FormState) => {
  const { data, status } = await useFetch('/api/auth/login', {
    method: 'POST',
    body: values,
  });

  if (status.value === 'error') {
    message.error(data.value?.message || 'Неправильный логин или пароль');

    return;
  }

  setData(data.value, 'user');
  emits('close');
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};
</script>

<template>
  <a-form
    class="modal__form"
    :model="model"
    name="basic"
    autocomplete="off"
    @finish="onFinish"
    layout="vertical"
    @finishFailed="onFinishFailed"
  >
    <a-form-item
      label="Почта"
      name="login"
      :rules="[{ required: true, message: 'Please input your username!' }]"
    >
      <a-input
        v-model:value="model.login"
        size="large"
      />
    </a-form-item>

    <a-form-item
      label="Пароль"
      name="password"
      :rules="[{ required: true, message: 'Please input your password!' }]"
    >
      <a-input-password
        v-model:value="model.password"
        size="large"
      />
    </a-form-item>

    <a-button
      class="button"
      block
      type="primary"
      html-type="submit"
      size="large"
      >Войти
    </a-button>

    <div class="text-small">
      Нет аккаунта на нашем портале?
      <span @click="emits('registration', true)">Зарегестрироваться</span>
    </div>

    <div class="text-small">Забыли пароль? <span>Восстановить</span></div>
  </a-form>
</template>

<style lang="scss" scoped>
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
