<script setup lang="ts">
import { RCard, RHeader } from '@/components';

import { ItemThing, ItemFilters } from '@/entities/main';

const { data } = useFetch('/api/search/books');
</script>

<template>
  <div class="main-bg"></div>

  <section class="main">
    <ClientOnly>
      <swiper-container
        :slides-per-view="4"
        :spaceBetween="10"
        :free-mode="true"
        ref="containerRef"
      >
        <swiper-slide
          v-for="(i, idx) in data.catalog"
          :key="idx"
        >
          <r-card>
            {{ i.name }}
          </r-card>
        </swiper-slide>
      </swiper-container>
    </ClientOnly>
  </section>
  <section class="news">
    <r-header bold>Новинки</r-header>

    <div class="grid">
      <div
        v-if="data.news"
        class="grid__news"
      >
        <div
          v-for="(item, key) in data.news"
          :key="key"
          class="grid-item"
        >
          <ItemThing :item="item" />

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

      <div
        v-if="data.books"
        class="grid__read-now"
      >
        <r-header
          class="grid__read-now__title"
          bold
        >
          Сейчас читают
        </r-header>

        <div
          v-for="(item, key) in data.books"
          :key="key"
          class="grid__read-now-item"
        >
          <ItemThing :item="item" />
        </div>
      </div>
    </div>
  </section>

  <section
    v-if="data.filters"
    class="filters"
  >
    <div class="filters__grid">
      <div
        v-for="(item, key) in data.filters"
        :key="key"
        class="filters__grid-item"
      >
        <ItemFilters :item="item" />
      </div>
    </div>
  </section>

  <section class="genres">
    <r-header bold> Популярыне жанры </r-header>
  </section>
</template>

<style lang="scss" scoped>
.a-flex {
  overflow-x: auto;
  white-space: nowrap;
  padding: 8px 0;
}

.container {
  padding-top: 100px;
}

.news {
  padding-top: 300px;
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

.divider {
  background-color: #c2c2c2;
  margin: 35px 0 0 0;
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

  &__title {
    padding-bottom: 48px;
  }

  &-bg {
    position: absolute;
    background-image: url('../public//main_bg.png');
    background-size: cover;
    min-height: 785px;
    width: 100%;
    top: 0%;
    left: 0;
    background-repeat: no-repeat;
  }
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  &-item {
    padding: 35px 35px 0 35px;
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
    padding: 30px 20px;
  }
}
</style>
