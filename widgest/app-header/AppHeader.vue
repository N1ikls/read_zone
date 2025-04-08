<script setup lang="ts">
import { RText } from '@/shared/ui';
const theme = ref(false);
</script>

<template>
  <div class="app-header">
    <div class="app-header__logo">
      <img src="@/public/logo.svg" />
    </div>

    <nav class="app-header__nav">
      <a-space warp>
        <a-button type="link">
          <r-text>Каталог</r-text>
        </a-button>

        <a-button type="link"> <r-text>Сообщество</r-text> </a-button>

        <a-button type="link"> <r-text>FAQ</r-text> </a-button>
      </a-space>
    </nav>

    <a-space
      warp
      size="large"
    >
      <NuxtLink to="/home"> Поиск </NuxtLink>

      <a-switch
        size="small"
        v-model:checked="theme"
      >
        <template #checkedChildren>
          <CheckOutlined />
        </template>
      </a-switch>

      <a-button
        size="small"
        type="primary"
      >
        Вход / Регистрация
      </a-button>
    </a-space>
  </div>
</template>

<style lang="scss" scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex: 1;

  &__nav {
    button {
      font-weight: 600;
    }
  }
}
</style>
