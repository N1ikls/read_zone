<script lang="ts" setup>
import { message } from 'ant-design-vue';
import type { FormState } from '../../types';
import { ItemAuth } from '../item-auth';
import { ItemRegistration } from '../item-registration';
import { cloneDeep } from 'es-toolkit';

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
</script>

<template>
  <a-modal
    class="modal"
    :maskClosable="false"
    v-model:open="show"
    width="812px"
    :footer="null"
    @cancel="close"
  >
    <div class="modal__wrapper">
      <div class="modal__title">
        <r-header>{{ isAuth ? 'Авторизация' : 'Регистрация' }} </r-header>
      </div>

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

      <div class="modal__actions">
        <a-button>
          <template #icon>
            <Icon name="my-icons:auth-telegram" />
          </template>
        </a-button>
        <a-button>
          <template #icon>
            <Icon name="my-icons:auth-vk" />
          </template>
        </a-button>
        <a-button>
          <template #icon>
            <Icon name="my-icons:auth-google" />
          </template>
        </a-button>
        <a-button>
          <template #icon>
            <Icon name="my-icons:auth-email" />
          </template>
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<style lang="scss" scoped>
.modal {
  &__wrapper {
    padding: 0 40px;
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
