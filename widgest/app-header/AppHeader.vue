<script setup lang="ts">
import { RText } from '@/components';
import { ModalAuth, useAuth } from '@/entities/auth';
import { ItemAvatar } from './ui';

const { showModal, setUser } = useAuth();
const { isShow, user } = storeToRefs(useAuth());

const theme = ref(false);

const logout = async () => {
  const { data } = await useFetch('/api/auth/logout', {
    method: 'POST',
  });

  if (!data.value?.ok) return;

  setUser(null);
};
</script>

<template>
  <div class="app-header">
    <NuxtLink to="/">
      <div class="app-header__logo">
        <Icon name="my-icons:logo" />
      </div>
    </NuxtLink>

    <nav class="app-header__nav">
      <NuxtLink to="/catalog">
        <r-text
          icon="my-icons:list"
          size="large"
        >
          Каталог
        </r-text>
      </NuxtLink>

      <r-text
        icon="my-icons:group"
        size="large"
      >
        Сообщество
      </r-text>

      <r-text
        icon="my-icons:faq"
        size="large"
      >
        FAQ
      </r-text>
    </nav>

    <a-space
      warp
      size="large"
    >
      <NuxtLink to="/home"> Поиск </NuxtLink>

      <a-switch v-model:checked="theme">
        <template #checkedChildren>
          <CheckOutlined />
        </template>
      </a-switch>

      <a-button
        v-if="!user"
        type="primary"
        @click="showModal"
      >
        Вход / Регистрация
      </a-button>

      <ItemAvatar v-else />
    </a-space>
  </div>

  <ModalAuth v-model:show="isShow" />
</template>

<style lang="scss" scoped>
.app-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 40px;
  }

  a {
    text-decoration: none;
  }

  &__logo {
    display: flex;
    align-items: center;
    font-size: var(--logo-size);
  }
}
</style>
