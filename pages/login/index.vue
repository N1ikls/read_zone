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

const { signIn, status, data, signOut } = useAuth();

const credentials = reactive({
  email: '',
  password: '',
});

const loading = ref(false);

const handleSubmit = async () => {
  try {
    loading.value = true;
    await signIn('credentials', {
      ...credentials,
      redirect: false,
    });
  } catch (error) {
    message.error('Неверный логин или пароль');
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="container">
    {{ data }} {{ status }}

    <a-button @click="signOut()">signOut</a-button>
    <a-form
      layout="vertical"
      :model="credentials"
      @finish="handleSubmit"
      class="login-form"
    >
      <a-form-item
        label="Email"
        name="email"
        :rules="[{ required: true, message: 'Введите имя пользователя' }]"
      >
        <a-input
          v-model:value="credentials.email"
          placeholder="email"
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
