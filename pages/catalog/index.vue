<script setup lang="ts">
import { RText, RThing } from '@/components';
import { Status } from './consts';
import { ItemFilter } from '@/entities/catalog';

const loading = ref(false);
const name = ref('');
const sort = ref('update');

const currentPage = ref(1);
const pageSize = ref(10);
const totalItems = computed(() => data.value?.at(0)?.length || 0);

const data = ref([]);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return (
    data.value?.at(0)?.slice(start, end) ||
    Array.from({ length: 100 }, () => ({ name: 'dsadasdas' }))
  );
});

const books = ref(data.value?.[0] || []);
const filter = ref(data.value?.[1] || {});

const handlePageChange = (page: number) => {
  currentPage.value = page;
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleSizeChange = (current: number, size: number) => {
  currentPage.value = 1;
  pageSize.value = size;
};

function submit() {}
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

    <section class="catalog">
      <ItemFilter>
        <div class="catalog__items">
          <div
            v-for="(item, index) in paginatedData"
            :key="index"
            class="catalog__items-card"
          >
            <r-thing>
              <template #avatar>
                <img
                  class="avatar"
                  src="../../public/catalog.jpg"
                />
              </template>

              {{ item?.name }}

              <template #text>
                <a-tag
                  v-for="(tag, tagIndex) in item.tags?.slice(0, 3)"
                  :key="tagIndex"
                  class="text-tag"
                  color="#FFFFFF"
                >
                  {{ tag }}
                </a-tag>
                <a-tag
                  v-if="item.rating"
                  class="text-tag"
                  color="#FFFFFF"
                >
                  {{ item.rating.toFixed(2) }}
                </a-tag>
              </template>

              <template #content> dsadas </template>

              <template
                v-if="item.description"
                #description
              >
                <span class="description">
                  {{ item.description }}
                </span>
              </template>

              <template
                v-if="item.status"
                #extra
              >
                <a-tag
                  class="tag"
                  color="#1E9E1E"
                >
                  {{ Status[item.status as keyof typeof Status] }}
                </a-tag>
              </template>
            </r-thing>
          </div>
        </div>
      </ItemFilter>

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
    </section>
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

  &__items {
    &-card {
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 10px;
      margin-bottom: 16px;

      .avatar {
        width: 140px;
        height: 140px;
        border-radius: 10px;
        object-fit: cover;
      }
      .tag {
        padding: 4px 11px;
        margin: 0;
        font-size: 15px;
        font-weight: 600;
        color: #ffffff;
        border-radius: 10px;
      }
      .description {
        color: #000000;
        font-size: 12px;
        font-weight: 300;
        vertical-align: middle;
      }

      .text-tag {
        padding: 3px 10px;
        border-radius: 10px;
        margin-right: 4px;
        color: #000000;
        font-size: 14px;
        font-weight: 600;
      }
    }
  }
}
</style>
