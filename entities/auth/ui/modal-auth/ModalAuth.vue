<script lang="ts" setup>
import type { FormState } from '../../types';
import { ItemAuth } from '../item-auth';
import { ItemRegistration } from '../item-registration';
import { cloneDeep } from 'es-toolkit';
import { AUTH_FOOTER_BUTTONS } from '../../consts';
const DEFAULT = {
  login: '',
  username: '',
  password: '',
  ok: false,
};
const model = ref<FormState>(cloneDeep(DEFAULT));

const isAuth = ref<boolean>(true);

const show = defineModel('show', {
  default: false,
});

const close = () => {
  show.value = false;
  model.value = cloneDeep(DEFAULT);
  isAuth.value = true;
};

watch(show, (value) => {
  if (!value) return;
  isAuth.value = true;
});
</script>

<template>
  <u-modal
    v-model:open="show"
    :ui="{
      content: 'min-w-[812px] ',
      header: 'justify-center border-[0]',
      body: 'border-[0] ',
      footer: 'flex items-center justify-center gap-5 p-6',
    }"
  >
    <template #title>
      <r-header
        class="text-[#000000]"
        bottom="0"
      >
        {{ isAuth ? 'Авторизация' : 'Регистрация' }}
      </r-header>
    </template>

    <template #body>
      <div class="w-full h-full">
        <item-auth
          v-if="isAuth"
          v-model="model"
          @registration="() => (isAuth = false)"
          @close="close"
        />

        <item-registration
          v-else
          v-model="model"
          @close="close"
        />
      </div>
    </template>

    <template #footer>
      <u-button
        v-for="name in AUTH_FOOTER_BUTTONS"
        class="flex items-center justify-center bg-[#f5f5f5] hover:bg-[#f5f5f5] w-25 h-25 text-[40px] rounded-[15px] cursor-pointer"
      >
        <u-icon
          mode="svg"
          :name="name"
        />
      </u-button>
    </template>
  </u-modal>
</template>

<style lang="scss" scoped>
.modal {
  &__wrapper {
    padding: 20px 15px;
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
  &__actions {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 25px 0;
    gap: 20px;

    button {
      display: flex;
      align-items: center;
      justify-content: center;

      width: 100px;
      height: 100px;
      background-color: #f5f5f5;

      span {
        font-size: 40px;
      }
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
