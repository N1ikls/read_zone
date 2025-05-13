<script setup lang="ts">
import { RText, RThing } from '@/components';
import { Status } from './consts';

const loading = ref(false);
const name = ref('');
const sort = ref('update');

const currentPage = ref(1);
const totalItems = ref(0);
const pageSize = ref(10);

const { data } = await useAsyncData(async () => {
  try {
    const event = useRequestEvent();
    const route = useRoute();
    const storage = event?.context.storage;

    const books = await storage.book.catalogSearch({
      sort: sort.value,
      ...route.query,
    });

    const filterData = await Promise.all([
      route.query.fandoms
        ? storage.fandom.find({ id: route.query.fandoms.split(',') })
        : [],
      route.query.genres
        ? storage.genre.find({ id: route.query.genres.split(',') })
        : [],
      route.query.tags
        ? storage.tag.find({ id: route.query.tags.split(',') })
        : [],
    ]);
    const filter = {
      fandoms: filterData[0].map((fandom) => {
        return {
          id: fandom.id,
          name: fandom.name,
        };
      }),
      genres: filterData[1].map((genre) => {
        return {
          id: genre.id,
          name: genre.name,
        };
      }),
      tags: filterData[2].map((tag) => {
        return {
          id: tag.id,
          name: tag.name,
        };
      }),
      types: route.query.types
        ? route.query.types.split(',').map((type) => {
            return {
              type,
              name: bookTypeName(type),
            };
          })
        : [],
    };

    return [books.map((book) => storage.book.toPublic(book)), filter];
  } catch (e) {
    console.error(e);
  }
});

const total = computed(() => data.value?.at(0).length);

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return data.value?.at(0)?.slice(start, end);
});

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleSizeChange = (current: number, size: number) => {
  currentPage.value = 1;
  pageSize.value = size;
};

const books = ref(data.value[0]);
const filter = ref(data.value[1]);

function buildQuery(filter) {
  const args = [`sort=${sort.value}`];

  if (name.value) args.push('name=' + encodeURIComponent(name.value));

  for (const field of [
    'ageRate',
    'chaptersFrom',
    'chaptersTo',
    'rateFrom',
    'rateTo',
    'status',
    'yearFrom',
    'yearTo',
  ]) {
    if (filter[field])
      args.push(`${field}=${encodeURIComponent(filter[field])}`);
  }

  const fandoms = filter.fandoms.map((fandom) => fandom.id);
  if (fandoms.length)
    args.push('fandoms=' + encodeURIComponent(fandoms.join(',')));

  const genres = filter.genres.map((genre) => genre.id);
  if (genres.length)
    args.push('genres=' + encodeURIComponent(genres.join(',')));

  const tags = filter.tags.map((tag) => tag.id);
  if (tags.length) args.push('tags=' + encodeURIComponent(tags.join(',')));

  const types = filter.types.map((type) => type.type);
  if (types.length) args.push('types=' + encodeURIComponent(types.join(',')));

  return args.join('&');
}

function submit() {
  loading.value = true;

  const query = buildQuery(filter.value);

  useFetch(`/search/books?${query}`)
    .then((response) => {
      if ('books' in response) books.value = response.books;
    })
    .catch(console.error)
    .finally(() => (loading.value = false));
}

console.log(data.value?.at(0));
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
      <div class="catalog__filters">
        <a-input
          class="input"
          v-model:value="name"
          :bordered="false"
          placeholder="Найти по названию книги"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>

        <a-button class="button">
          <template #icon>
            <Icon name="my-icons:sorter-low" />
          </template>
        </a-button>

        <a-button class="button">
          <template #icon> <Icon name="my-icons:sorter-up" /> </template>
        </a-button>

        <a-button
          class="button-filter"
          type="primary"
        >
          <Icon name="my-icons:filters" />

          <span class="button-filter__text">Фильтры</span>
        </a-button>
      </div>

      <div class="catalog__items">
        <div
          v-for="(item, index) in data?.at(0)"
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
                class="text-tag"
                color="#FFFFFF"
              >
                Романтика
              </a-tag>
              <a-tag
                class="text-tag"
                color="#FFFFFF"
              >
                Повседневность
              </a-tag>
              <a-tag
                class="text-tag"
                color="#FFFFFF"
              >
                Комедия
              </a-tag>
              <a-tag
                class="text-tag"
                color="#FFFFFF"
              >
                4.95
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

      <div class="catalog__pagination">
        <a-pagination
          v-model:current="currentPage"
          :total="total"
          :pageSize="pageSize"
          @change="handlePageChange"
          @showSizeChange="handleSizeChange"
        />
      </div>
    </section>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.catalog {
  &__filters {
    display: grid;
    align-items: center;
    gap: 12px;
    grid-template-columns: 1fr 40px 40px 110px;
    margin-bottom: 30px;
  }

  &__pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 45px;
  }

  .button {
    border-radius: 10px;
    width: 37px;
    height: 37px;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      font-size: 15px;
    }

    &-filter {
      display: flex;
      align-items: center;
      border-radius: 10px;
      height: 37px;

      &__text {
        margin-left: 6px;
      }
    }
  }

  .input {
    border-radius: 10px;
    background-color: #f5f5f5;
    min-height: 37px;
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
