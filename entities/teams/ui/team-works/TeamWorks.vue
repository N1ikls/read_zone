<script lang="ts" setup>
import { ItemsCard } from '@/entities/catalog';
import { debounce } from 'es-toolkit';
import type { Team, TeamBooksApiResponse } from '@/shared/types';

const { item = {} } = defineProps<{
  item: Team;
}>();

const route = useRoute();
const teamId = computed(() => route.params?.id);

// Используем те же queries что и в каталоге для совместимости с фильтрами
const queries = useGetRouteQuery({
  page: 1,
  limit: 10,
  name: null,
  types: null,
  status: null,
  sort: null,
  genres: null,
  yearFrom: null,
  yearTo: null,
  chaptersFrom: null,
  chaptersTo: null,
  rateFrom: null,
  rateTo: null,
  ageRate: null,
});

// Убрали debounceParsedQueries, теперь используем $fetch напрямую

// Функция для фильтрации пустых значений
const prepareFilters = (q: any) => {
  const prepared: any = {};
  
  Object.keys(q).forEach(key => {
    const value = q[key];
    
    // Пропускаем null, undefined и пустые строки
    if (value !== null && value !== undefined && value !== '') {
      prepared[key] = value;
    }
  });
  
  return prepared;
};

// Удалили инициализацию debounceParsedQueries

// Используем реактивные данные для результата
const data = ref<TeamBooksApiResponse>({
  success: true,
  message: '',
  timestamp: '',
  items: { books: [], total: 0, page: 1, limit: 10, hasMore: false },
  meta: {
    team: { id: '', name: '' },
    pagination: { page: 1, limit: 10, total: 0, hasMore: false, nextPage: null, totalPages: 0 },
    filters: {}
  },
});

const loading = ref(false);

// Функция для выполнения запроса
const fetchBooks = async (filters: any) => {
  try {
    loading.value = true;
    
    // Используем $fetch для лучшего контроля над телом запроса
    const response = await $fetch<TeamBooksApiResponse>(`/api/teams/${teamId.value}/books`, {
      method: 'POST',
      body: JSON.parse(JSON.stringify(filters)) // Принудительная сериализация
    });
    
    data.value = response;
  } catch (error) {
    console.error('Error fetching team books:', error);
  } finally {
    loading.value = false;
  }
};

// Выполняем первичную загрузку
await fetchBooks(prepareFilters(queries.value));

// Используем debounce для оптимизации запросов при изменении фильтров
watch(
  queries,
  debounce(async (newValue) => {
    const filters = prepareFilters(newValue);
    console.log('Prepared filters for request:', filters);
    await fetchBooks(filters);
  }, 1000),
  { deep: true }
);

// Преобразуем данные для совместимости с ItemsCard
const catalogData = computed(() => ({
  items: data.value?.items?.books || [],
  total: data.value?.items?.total || 0,
  page: data.value?.items?.page || 1,
  limit: data.value?.items?.limit || 10,
}));
</script>

<template>
  <div class="work mt-4">
    <ItemsCard
      :data="catalogData"
      :queries="queries as any"
    />
  </div>
</template>
