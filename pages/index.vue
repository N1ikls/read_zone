<script setup lang="ts">
import { RCard, RHeader, RThing } from '@/components';

const { data } = useFetch('/api/search/books');
</script>

<template>
  <div class="main">
    <div class="main-bg" />
    <div class="container">
      <div class="main__manga">
        <r-card
          v-for="i in 8"
          :key="i"
        >
          {{ i }}
        </r-card>
      </div>
    </div>
  </div>

  <div class="container">
    <div class="main__news">
      <r-header bold>Новинки</r-header>

      <div class="grid">
        <div class="grid__news">
          <div
            v-for="(item, key) in data"
            :key="key"
            class="grid-item"
          >
            <r-thing>
              <template #avatar>
                <img
                  class="grid-item__img"
                  src="../public/test.png"
              /></template>

              {{ item.name }}

              <template #content>
                <span
                  v-for="(genre, index) in item.genres"
                  class="grid-item__tag"
                  :key="index"
                >
                  {{ genre.name }}
                </span>
              </template>

              <template #extra>
                <div class="extra">
                  <span> <icon name="my-icons:star" /> </span>

                  <span>{{ item.rate }}</span>
                </div>
              </template>

              <template #description>
                {{ item.description }}
              </template>

              <template #actions>
                {{ item.actions }}
              </template>
            </r-thing>

            <a-divider class="divider" />
          </div>

          <div class="grid__actions">
            <a-button
              class="button"
              type="primary"
            >
              Показать еще
            </a-button>
          </div>
        </div>

        <div class="grid__read-now">
          <r-header
            class="grid__read-now__title"
            bold
          >
            Сейчас читают
          </r-header>

          <div
            v-for="(item, key) in data"
            :key="key"
            class="grid-item"
          >
            <r-thing>
              <template #avatar>
                <img
                  class="grid-item__img"
                  src="../public/test.png"
                />
              </template>

              {{ item.name }}

              <template #content>
                <span
                  v-for="(genre, index) in item.genres"
                  class="grid-item__tag"
                  :key="index"
                >
                  {{ genre.name }}
                </span>
              </template>

              <template #description>
                {{ item.description }}
              </template>
            </r-thing>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  padding-top: 100px;
}
.button {
  width: 100%;
  color: #ffffff;
  font-weight: 700;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
}
.tag {
  font-weight: 400;
  padding: 3px;
  color: #131313;
}

.extra {
  display: flex;
  gap: 3px;
}

.divider {
  background-color: #c2c2c2;
  margin: 35px 0 0 0;
}

.main {
  position: relative;
  &-bg {
    // position: absolute;
    // background-image: url('../public//main_bg.png');
    // background-size: cover;
    // background-position: top;
    // min-height: 814px;
    // width: 100%;
    // background-repeat: no-repeat;
  }

  &__manga {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    padding-bottom: 48px;
  }

  &__news {
    padding-top: 240px;
  }
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  &-item {
    padding: 35px 35px 0 35px;
    &__tag {
      background-color: #97bfff;
      padding: 4px;
      border-radius: 4px;
      font-size: 12px;
    }
  }

  &__read-now {
    border: 1px solid #97bfff;
    border-radius: 10px;

    &__title {
      font-size: 40px;
      padding: 0;
    }
  }

  &__news {
    background-color: #ffffff;
    border-radius: 10px;
  }

  &__actions {
    padding: 30px 20px;
  }
}
</style>
