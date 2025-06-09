<script lang="ts" setup>
import type { FormState } from '../../types';

const model = defineModel<FormState>({
  default: () => ({}),
});

const emits = defineEmits<{
  (e: 'close'): void;
}>();

const { setData } = useLocalData();

const onFinish = async (values: FormState) => {
  const { data, status } = await useFetch('/api/auth/registration', {
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
      label="Никнейм"
      name="username"
      :rules="[{ required: true, message: 'Please input your username!' }]"
    >
      <a-input
        v-model:value="model.username"
        size="large"
      />
    </a-form-item>

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

    <a-form-item name="ok">
      <a-checkbox
        class="checkbox"
        v-model:checked="model.ok"
      >
        Принимаю
        <span>положения и условия политики конфиденциальности</span>
      </a-checkbox>
    </a-form-item>

    <a-button
      class="button"
      block
      type="primary"
      html-type="submit"
      size="large"
      >Создать аккаунт
    </a-button>
  </a-form>
</template>

<style lang="scss" scoped>
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
