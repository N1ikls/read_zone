<script setup lang="ts">
import { RCard, RHeader, RThing } from '@/components';

const { data: news } = useFetch('/api/news/news');
</script>

<template>
  <nuxt-layout name="default">
    <div class="main">
      <div class="container">
        <div class="main__manga">
          <r-card
            v-for="i in 8"
            :key="i"
          >
            {{ i }}
          </r-card>
        </div>

        <div class="main__new">
          <r-header bold>Новинки</r-header>

          <div class="main__new-flex">
            <r-thing
              v-for="item in news"
              :key="item.id"
            >
              {{ item }}
            </r-thing>
          </div>
        </div>
      </div>
    </div>
  </nuxt-layout>
</template>

<style lang="scss" scoped>
.container {
  padding-top: 100px;
}

.main {
  // background-image: url('../public//main_bg.png');
  // background-size: cover;
  // background-position: 100% 38%;
  // background-repeat: no-repeat;
  // min-height: 100vh;
  // width: 100%;

  &__manga {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    padding-bottom: 48px;
  }

  &__new {
    padding-top: 240px;

    &-flex {
      display: flex;
      flex-direction: column;
      background-color: #ffffff;
    }
  }
}
</style>
