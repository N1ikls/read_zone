<script lang="ts" setup>
import { useAuth } from '@/entities/auth';

const { user } = useAuth();
</script>

<template>
  <div class="user-sidebar">
    <img class="user-sidebar__logo" />

    <div class="user-sidebar__buttons">
      <a-button
        size="large"
        block
      >
        Мои работы
      </a-button>
      <a-button
        size="large"
        block
      >
        Мои доходы
      </a-button>
      <a-button
        size="large"
        block
      >
        Закладки
      </a-button>
    </div>

    <div class="user-sidebar__friends">
      <div class="grid">{{ user }}</div>
    </div>

    <div class="user-sidebar__links">
      <div class="user-sidebar__link">discord.com</div>
      <div class="user-sidebar__link">telegram.org</div>
      <div class="user-sidebar__link">twitch.tv</div>
      <div class="user-sidebar__link">vk.com</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-sidebar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 25px;

  img {
    border: none;
    width: 285px;
    height: 200px;
    background-color: #d6d6d6;
    border-radius: 10px;
  }

  &__buttons {
    button {
      height: 42px;
      font-size: 18px;
      font-weight: 700;
      color: #97bfff;
      background-color: #f5f5f5;
      margin-bottom: 10px;

      &:hover {
        color: #97bfff;
      }
    }
  }
}
</style>
