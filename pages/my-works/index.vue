<script setup lang="ts">
import { debounce } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';
import { ROUTES } from './consts';
import type { AcceptableValue } from '@nuxt/ui';
import { Status } from '@/entities/catalog';
const setRouteQueries = useSetRouteQuery();

definePageMeta({
  middleware: ['auth'],
});

const queries = useGetRouteQuery({
  name: null,
  page: 1,
  limit: 10,
  type: null,
  fandom: null,
});

// Инициализируем query параметры без null значений
const initialQueries = Object.fromEntries(
  Object.entries(unref(queries)).filter(
    ([_, value]) => value !== null && value !== '' && value !== undefined,
  ),
);
const debounceParsedQueries = ref(initialQueries as any);
const name = ref<string | null>(queries.value?.name);

const { data } = useFetch('/api/user/my-works', {
  key: 'my-works',
  method: 'get',
  query: debounceParsedQueries,
  default: () => ({ items: [], total: 0, page: 1, limit: 10 }),
  server: false, // Отключаем SSR для этого запроса
});

// Получаем список фэндомов
const { data: fandoms } = await useFetch('/api/fandoms', {
  default: () => [],
});

// Открытие страницы создания книги
const openCreateBookModal = () => {
  navigateTo('/book/create');
};

// Функция для сброса всех фильтров
const resetAllFilters = () => {
  navigateTo('/my-works');
};

const onUpdate = (value: AcceptableValue, key: string) => {
  const currentQuery = { ...queries.value } as Record<string, any>;

  if (value && value !== 'all' && value !== null) {
    currentQuery[key] = value as string;
  } else {
    // Удаляем параметр если значение 'all' или null
    delete currentQuery[key];
  }

  // Убираем null значения и пустые строки
  Object.keys(currentQuery).forEach((k) => {
    if (
      currentQuery[k] === null ||
      currentQuery[k] === 'all' ||
      currentQuery[k] === ''
    ) {
      delete currentQuery[k];
    }
  });

  setRouteQueries(resetPaginationQuery(currentQuery));
};

const handlePageChange = (page: number) => {
  setRouteQueries({ page: page.toString() });
};

watch(name, (value) => onUpdate(value, 'name'));

// Фильтруем статусы, исключая 'all'
const filteredStatus = computed(() => {
  const statusEntries = Object.entries(Status);
  return statusEntries.filter(([key]) => key !== 'all');
});

// Принудительно обновляем query при первой загрузке
onMounted(() => {
  const currentQueries = Object.fromEntries(
    Object.entries(unref(queries)).filter(
      ([_, value]) => value !== null && value !== '' && value !== undefined,
    ),
  );
  debounceParsedQueries.value = currentQueries as any;
});

watch(
  queries,
  debounce((newValue) => {
    // Фильтруем null значения перед отправкой запроса
    const filteredQueries = Object.fromEntries(
      Object.entries(newValue).filter(
        ([_, value]) => value !== null && value !== '' && value !== undefined,
      ),
    );
    debounceParsedQueries.value = filteredQueries as any;
  }, 300), // Уменьшаем задержку для более быстрого отклика
);
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb> <r-breadcrumb :options="ROUTES" /> </template>

    <template #title>
      <r-header
        bottom="0"
        class="uppercase text-[#003386]"
      >
        Мои работы
      </r-header>
    </template>

    <template #title-extra>
      <u-button
        class="gap-4 w-70 rounded-[10px] h-[42px] text-[#FFFFFF] bg-[#0862E0] font-bold text-lg hover:bg-[none] cursor-pointer items-center justify-center"
        @click="openCreateBookModal"
      >
        Создать книгу
      </u-button>
    </template>

    <div class="my-works">
      <div class="w-50 sidebar">
        <!-- Секция статусов работы -->
        <div class="mb-6">
          <h3 class="text-lg font-semibold mb-3 text-gray-800">
            По статусу работы
          </h3>
          <!-- Кнопка "Все работы" для сброса фильтров -->
          <u-button
            class="gap-4 rounded-[10px] h-[42px] text-[#FFFFFF] bg-[#97BFFF] font-bold text-xl hover:bg-[none] cursor-pointer mb-2"
            block
            :class="{ active: !queries.type || queries.type === 'all' }"
            @click="resetAllFilters"
          >
            Все работы
          </u-button>
          <u-button
            v-for="[key, name] in filteredStatus"
            :key="key"
            class="gap-4 rounded-[10px] h-[42px] text-[#FFFFFF] bg-[#97BFFF] font-bold text-xl hover:bg-[none] cursor-pointer mb-2"
            block
            :class="{ active: key === queries.type }"
            @click="onUpdate(key, 'type')"
          >
            {{ name }}
          </u-button>
        </div>

        <!-- Секция фэндомов -->
        <div v-if="fandoms && fandoms.length > 0">
          <h3 class="text-lg font-semibold mb-3 text-gray-800">Фэндомы</h3>
          <u-button
            v-for="fandom in fandoms"
            :key="fandom.id"
            class="gap-4 rounded-[10px] h-[42px] text-[#FFFFFF] bg-[#97BFFF] font-bold text-xl hover:bg-[none] cursor-pointer mb-2"
            block
            :class="{ active: fandom.id === queries.fandom }"
            @click="onUpdate(fandom.id, 'fandom')"
          >
            {{ fandom.name }}
          </u-button>
        </div>
      </div>

      <div class="column">
        <UInput
          v-model="name"
          icon="i-lucide-search"
          :va="name"
          size="md"
          :ui="{
            root: 'w-full mt-1',
            base: 'bg-[#F5F5F5] rounded-[10px]  h-9 placeholder:text-[#C2C2C2] placeholder:italic placeholder-text-base',
            trailing: 'pe-1',
          }"
          variant="soft"
          placeholder="Найти по названию книги"
        >
          <template
            v-if="name"
            #trailing
          >
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-circle-x"
              aria-label="Clear input"
              @click="name = null"
            />
          </template>
        </UInput>

        <div>
          <div v-if="!isEmpty(data?.items)">
            <r-card-status
              v-for="(item, index) in data.items"
              :key="index"
              :item="item"
            >
              <template #status>
                {{ Status[item.status as keyof typeof Status] }}
              </template>
            </r-card-status>

            <r-pagination
              :page="Number(queries.page)"
              :limit="Number(queries.limit)"
              :total="Number(data.total)"
              @update-page="handlePageChange"
            />
          </div>

          <div
            v-else
            class="text-center py-8 text-gray-500"
          >
            <p class="text-lg">Работы не найдены</p>
            <p class="text-sm mt-2">
              Попробуйте изменить фильтры или создать новую книгу
            </p>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.my-works {
  display: flex;
  gap: 30px;
}

.column {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 30px;
}

.sidebar {
  position: sticky;
  top: calc(var(--header-height) + 30px);
  display: flex;
  flex-direction: column;
  align-self: flex-start;
  gap: 16px;
}

.active {
  background-color: #003386;
}
</style>
