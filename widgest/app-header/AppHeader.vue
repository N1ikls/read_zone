<script setup lang="ts">
import { RText } from '@/components';
import { ModalAuth, useAuth } from '@/entities/auth';
import { ItemAvatar } from './ui';

const { showModal } = useAuth();
const { isShow, user } = storeToRefs(useAuth());
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

    <div class="flex items-center gap-3">
      <NuxtLink to="/home"> Поиск </NuxtLink>

      <u-button
        v-if="!user"
        color="primary"
        @click="showModal"
      >
        Вход / Регистрация
      </u-button>

      <ItemAvatar v-else />
    </div>
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
