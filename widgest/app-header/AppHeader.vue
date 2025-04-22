<script setup lang="ts">
import { RText } from '@/components';
const theme = ref(false);
</script>

<template>
  <div class="app-header">
    <div class="app-header__logo">
      <Icon name="my-icons:logo" />
    </div>

    <nav class="app-header__nav">
      <r-text
        icon="my-icons:list"
        size="v-large"
      >
        Каталог
      </r-text>

      <r-text
        icon="my-icons:group"
        size="v-large"
      >
        Сообщество
      </r-text>

      <r-text
        icon="my-icons:faq"
        size="v-large"
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

      <a-button type="primary"> Вход / Регистрация </a-button>
    </a-space>
  </div>
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

  &__logo {
    display: flex;
    align-items: center;
    font-size: 38px;
  }
}
</style>
