<script setup lang="ts">
import { RText } from '@/components';
import { ModalAuth, useAuth } from '@/entities/auth';
import { ItemAvatar } from './ui';

const { showModal } = useAuth();
const { isShow, user } = storeToRefs(useAuth());

const colorMode = useColorMode();

const isDark = computed({
  get() {
    return colorMode.value === 'dark';
  },
  set(_isDark) {
    colorMode.preference = _isDark ? 'dark' : 'light';
  },
});
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
          class="font-semibold"
          icon="my-icons:list"
        >
          Каталог
        </r-text>
      </NuxtLink>

      <nuxt-link to="/faq">
        <r-text
          class="font-semibold"
          icon="my-icons:group"
        >
          Сообщество
        </r-text>
      </nuxt-link>

      <nuxt-link to="/faq">
        <r-text
          class="font-semibold"
          icon="my-icons:faq"
        >
          FAQ
        </r-text>
      </nuxt-link>
    </nav>

    <div class="flex items-center gap-3">
      <NuxtLink to="/home"> Поиск </NuxtLink>

      <ClientOnly v-if="!colorMode?.forced">
        <u-switch
          unchecked-icon="my-icons:sun"
          checked-icon="my-icons:is-dark"
          color="info"
          v-model="isDark"
        />
        <template #fallback>
          <div class="h-5 w-9" />
        </template>
      </ClientOnly>

      <u-button
        v-if="!user"
        class="rounded-[10px] font-bold text-highlighted"
        color="info"
        size="md"
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
