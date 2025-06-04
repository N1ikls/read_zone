<script setup lang="ts">
import { RCard, RHeader } from '@/components';
import { ItemThing, ItemFilters } from '@/entities/main';

const {data} = await useAsyncData(async () => {
  try {
    const event = useRequestEvent()
    const storage = event.context.storage

    const [sliderBooks, newBooks, booksInProgress, topGenres] = await Promise.all([
      storage.book.find({}, {limit: 13, order: {id: 'desc'}}),
      storage.book.find({}, {limit: 4, order: {id: 'desc'}}),
      storage.book.find({}, {limit: 5, order: {id: 'asc'}}),
      storage.genre.find({}, {limit: 9}),
    ])

    await Promise.all([
      storage.book.attachGenres(newBooks),
      storage.book.attachGenres(booksInProgress)
    ])

    return {
      sliderBooks,
      newBooks: newBooks.map(book => storage.book.toPublic(book)),
      booksInProgress: booksInProgress.map(book => storage.book.toPublic(book)),
      topGenres: topGenres.map(genre => storage.genre.toPublic(genre))
    }
  } catch(e) {console.error(e)}
})

const { sliderBooks = [], newBooks = [], booksInProgress = [], topGenres = [] } = data.value ?? {}

</script>

<template>
  <section class="main">
    <div class="main-bg"></div>

    <ClientOnly>
      <swiper-container
        :slides-per-view="4"
        :spaceBetween="10"
        :free-mode="true"
        ref="containerRef"
      >
        <swiper-slide
          v-for="(i, idx) in sliderBooks"
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
      <div class="grid__news">
        <div
          v-for="(item, key) in newBooks"
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

      <div class="grid__read-now">
        <r-header
          class="grid__read-now__title"
          bold
        >
          Сейчас читают
        </r-header>

        <div
          v-for="(item, key) in booksInProgress"
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
        <ItemFilters :item="{item}" />
      </div>
    </div>
  </section>

  <section class="genres">
    <r-header bold> Популярыне жанры </r-header>
    <div v-for="genre in topGenres.slice(3)" :key="genre.id" style="display: inline-block; margin-right: 20px;">
      {{ genre.name }}
    </div>
    <div></div>
    <div v-for="genre in topGenres.slice(0, 3)" :key="genre.id">{{ genre.name }}</div>
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
  position: relative;
  z-index: 2;
  padding-top: 237px;
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
