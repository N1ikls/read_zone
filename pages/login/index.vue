<script setup lang="ts">
import { LockOutlined, UserOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

definePageMeta({
  layout: 'default',
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/',
  },
});

const { signIn } = useAuth();

const credentials = reactive({
  username: '',
  password: '',
});

const loading = ref(false);
</script>

<template>
  <div class="container">
    <a-form
      layout="vertical"
      :model="credentials"
      class="login-form"
    >
      <a-form-item
        label="Имя пользователя"
        name="username"
        :rules="[{ required: true, message: 'Введите имя пользователя' }]"
      >
        <a-input
          v-model:value="credentials.username"
          placeholder="Username"
        >
          <template #prefix>
            <UserOutlined />
          </template>
        </a-input>
      </a-form-item>

      <a-form-item
        label="Пароль"
        name="password"
        :rules="[{ required: true, message: 'Введите пароль' }]"
      >
        <a-input-password
          v-model:value="credentials.password"
          placeholder="Password"
        >
          <template #prefix>
            <LockOutlined />
          </template>
        </a-input-password>
      </a-form-item>

      <a-form-item>
        <a-button
          type="primary"
          html-type="submit"
          :loading="loading"
          block
        >
          Войти
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<style lang="scss" scoped>
.container {
  padding-top: 70px;
}
</style>
