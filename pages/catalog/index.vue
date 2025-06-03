<script setup lang="ts">
import { ItemCatalog } from './ui';

const loading = ref(false);
const name = ref('');
const sort = ref('update');

const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = ref(0);

const handlePageChange = (page: number) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleSizeChange = (current: number, size: number) => {
  currentPage.value = 1;
  pageSize.value = size;
};

function submit() {}

const {data} = await useAsyncData(async () => {
  try {
    const event = useRequestEvent()
    const storage = event.context.storage

    const filter = {}

    const [books, genres, tags] = await Promise.all([
      storage.book.catalogSearch({}),
      storage.genre.find({}, {toPublic: true}),
      storage.tag.find({}, {toPublic: true}),
    ])

    await storage.book.attachGenres(books)

    return {
      filter,
      books: books.map(book => storage.book.toPublic(book)),
      genres,
      tags,
    }
  } catch(e) {console.error(e)}
})

const { filter = {}, books = [], genres = [], tags = [] } = data.value ?? {}
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb>
      <a-breadcrumb>
        <a-breadcrumb-item>Главная</a-breadcrumb-item>
        <a-breadcrumb-item>Каталог</a-breadcrumb-item>
      </a-breadcrumb>
    </template>

    <template #title>
      <r-text size="v-large">Каталог</r-text>
    </template>

    <ItemCatalog :filter="filter" :items="books" :genres="genres" :tags="tags" />

    <ClientOnly>
      <div
        v-if="totalItems > pageSize"
        class="catalog__pagination"
      >
        <a-pagination
          v-model:current="currentPage"
          :total="totalItems"
          :pageSize="pageSize"
          @change="handlePageChange"
          @showSizeChange="handleSizeChange"
          :show-size-changer="false"
        />
      </div>
    </ClientOnly>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.catalog {
  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 45px;
  }
}
</style>
