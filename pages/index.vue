<script setup lang="ts">
import { RCard, RHeader } from '@/components';
import { ItemThing, ItemFilters, ItemCarousel } from '@/entities/main';
import type { Book } from '~/shared/types';

const limit = ref<number>(4);

const { data } = await useFetch<Book[]>('/api/slider-books', {
  server: false,
});
const { data: news } = await useFetch<Book[]>('/api/new', {
  query: {
    limit,
  },
});
const { data: read } = await useFetch('/api/read-now');
const { data: top } = await useFetch('/api/top-genres');
</script>

<template>
  <div class="light:bg-[#E0EAFF] min-h-screen pt-4">
    <div class="wrapper">
      <item-carousel :items="data" />

      <section class="news mt-4">
        <r-header
          bottom="0"
          class="text-[#003386]"
          >Новинки
        </r-header>

        <div class="grid mt-8">
          <div class="grid__news">
            <div
              v-for="(item, key) in news"
              :key="key"
              class="grid-item"
            >
              <ItemThing :item="item" />

              <div class="grid-item__border" />
            </div>

            <div class="grid__actions">
              <u-button
                class="button font-bold"
                color="info"
                size="xl"
                block
              >
                Показать еще
              </u-button>
            </div>
          </div>

          <div class="grid__read-now">
            <r-header class="grid__read-now__title text-[#003386]">
              Сейчас читают
            </r-header>

            <div
              v-for="(item, key) in read"
              :key="key"
              class="grid__read-now-item"
            >
              <ItemThing :item="item" />
            </div>
          </div>
        </div>
      </section>

      <section class="filters">
        <div class="filters__grid">
          <div
            v-for="(item, key) in [1, 3, 4, 5, 6, 1, 1, 1, 1]"
            :key="key"
            class="filters__grid-item"
          >
            <ItemFilters :item="{ item }" />
          </div>
        </div>
      </section>

      <section class="genres mt-8">
        <r-header
          class="text-[#003386]"
          bold
        >
          Популярыне жанры
        </r-header>

        <r-banner
          v-for="(genre, index) in top?.slice(0, 4)"
          :key="index"
        >
          {{ genre.name }}
        </r-banner>

        <u-button
          block
          color="info"
          size="lg"
          class="text-[18px] font-bold rounded-[10px]"
          to="/catalog"
        >
          Перейти в каталог
        </u-button>
      </section>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.container {
  padding-top: 100px;
}

.news {
  position: relative;
  z-index: 2;
}

.slide {
  width: 264px !important;
  padding-right: 20px;
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

.filters {
  padding: 110px 0;

  &__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    padding: 25px;
    background-color: #c5dcff;
    border-radius: 10px;
    overflow-x: auto;
    height: 520px;

    &-item {
      padding: 12px;
      border-radius: 10px;
      background-color: #b2cfff;
    }
  }
}

.main {
  z-index: 1;

  &__scroll {
    overflow-x: auto;
    white-space: nowrap;
    padding: 8px 0;

    &:deep(.r-card) {
      margin-right: 25px;
    }
  }

  &__manga {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &-bg {
    position: absolute;
    background-image: url('../public//main_bg.png');
    background-size: cover;
    height: 100%;
    width: 100%;
    transform: translateY(0%);
    top: 0%;
    left: 0;
    background-repeat: no-repeat;

    @media screen and (width >= 1920px) {
      transform: translateY(-5%);
    }
  }

  &__title {
    padding-bottom: 48px;
  }
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  &-item {
    padding: 35px 35px 0 35px;

    &__border {
      border-radius: 1px;
      border-bottom: 1px solid #c2c2c2;
      margin: 35px 0 0 0;
    }
  }

  &__read-now {
    border: 1px solid #97bfff;
    border-radius: 10px;

    &__title {
      font-size: 40px;
      padding: 20px 35px;
    }

    &-item {
      padding: 0 35px 35px 35px;
    }
  }

  &__news {
    background-color: #ffffff;
    border-radius: 10px;
  }

  &__actions {
    padding: 35px 20px;
  }
}
</style>
