<script setup lang="ts">
import { RHeader } from '@/shared/ui';
definePageMeta({
  key: (route) => route.fullPath,
});
</script>

<template>
  <nuxt-layout name="default">
    <div class="main">
      <div class="container">
        <r-header
          class="main__title"
          level="1"
        >
          Популярные манги
        </r-header>
        dasdas
      </div>
    </div>

    <div class="container">dsadsadas</div>
  </nuxt-layout>
</template>

<style lang="scss" scoped>
.main {
  background-image: url('../public//main_bg.png');
  background-size: cover;
  background-position: 50% 11%;
  background-repeat: no-repeat;
  height: 100%;
  width: 100%;

  &__title {
    padding-bottom: 48px;
  }
  .container {
    padding-top: 70px;
  }
}
</style>
