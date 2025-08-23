<template>
  <div class="book-novelties">
    <!-- Заголовок секции -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Новинки недели</h2>
        <p class="text-sm text-gray-600">
          Свежие книги за последние 7 дней
          <span
            v-if="noveltiesState.total > 0"
            class="text-blue-600"
          >
            ({{ noveltiesState.total }} книг)
          </span>
        </p>
      </div>

      <!-- Кнопки управления -->
      <div class="flex items-center space-x-2">
        <!-- Индикатор загрузки -->
        <div
          v-if="noveltiesLoading"
          class="flex items-center space-x-2 text-blue-600"
        >
          <div
            class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"
          ></div>
          <span class="text-sm">Загрузка...</span>
        </div>

        <!-- Кнопка повтора при ошибке -->
        <button
          v-if="noveltiesHasError && noveltiesCanRetry"
          @click="handleRetry"
          class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          title="Повторить попытку"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Сообщение об ошибке -->
    <div
      v-if="noveltiesHasError"
      class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg"
    >
      <div class="flex items-center">
        <svg
          class="w-5 h-5 text-red-400 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span class="text-red-800">{{ noveltiesState.error }}</span>
      </div>
    </div>

    <!-- Сетка книг -->
    <div
      v-if="noveltiesLoading && noveltiesIsEmpty"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      <!-- Скелетоны загрузки -->
      <div
        v-for="i in 4"
        :key="i"
        class="animate-pulse"
      >
        <div class="bg-gray-200 aspect-[3/4] rounded-lg mb-3"></div>
        <div class="h-4 bg-gray-200 rounded mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>

    <!-- Пустое состояние -->
    <div
      v-else-if="noveltiesIsEmpty && !noveltiesLoading"
      class="text-center py-12"
    >
      <svg
        class="mx-auto h-12 w-12 text-gray-400 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Новинок пока нет</h3>
      <p class="text-gray-500">За последнюю неделю новых книг не появилось</p>
    </div>

    <!-- Список книг -->
    <div
      v-else-if="noveltiesState.books.length > 0"
      class="space-y-6"
    >
      <div
        v-for="book in noveltiesState.books"
        :key="book.id"
        class="group cursor-pointer bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
        @click="navigateToBook(book)"
      >
        <!-- Обложка книги -->
        <div
          class="relative aspect-[3/4] rounded-lg overflow-hidden mb-3 bg-gray-100"
        >
          <img
            v-if="book.cover"
            :src="book.cover"
            :alt="book.name"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          <div
            v-else
            class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500"
          >
            <svg
              class="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>

          <!-- Бейдж "Новинка" -->
          <div
            class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium"
          >
            Новинка
          </div>

          <!-- Статус книги -->
          <div class="absolute top-2 right-2">
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              :class="getStatusClass(book.status)"
            >
              {{ getStatusLabel(book.status) }}
            </span>
          </div>
        </div>

        <!-- Информация о книге -->
        <div class="space-y-1">
          <h3
            class="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors"
          >
            {{ book.name }}
          </h3>

          <p class="text-sm text-gray-600">
            {{ book.author_name }}
          </p>

          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>{{ formatDate(book.created_at) }}</span>
            <div class="flex items-center space-x-2">
              <span v-if="book.chapters_count"
                >{{ book.chapters_count }} гл.</span
              >
              <span
                v-if="book.rate"
                class="flex items-center"
              >
                <svg
                  class="w-3 h-3 text-yellow-400 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </svg>
                {{ book.rate.toFixed(1) }}
              </span>
            </div>
          </div>

          <!-- Жанры -->
          <div
            v-if="book.genres && book.genres.length"
            class="flex flex-wrap gap-1 mt-2"
          >
            <span
              v-for="genre in book.genres.slice(0, 3)"
              :key="genre.id"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {{ genre.name }}
            </span>
            <span
              v-if="book.genres.length > 3"
              class="text-xs text-gray-500"
            >
              +{{ book.genres.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Информация о следующем обновлении -->
    <div
      v-if="rotationInfo.isRotating && !loading"
      class="mt-6 text-center"
    >
      <p class="text-sm text-gray-500">
        Автоматическое обновление каждые
        {{ rotationInfo.rotationIntervalMinutes }} минут
      </p>
    </div>
  </div>
</template>

<script setup>
import type { Book } from '~/shared/types';

// Пропсы
const props = defineProps({
  limit: {
    type: Number,
    default: 4,
  },
});

// Используем production-ready composable для новинок
const {
  state: noveltiesState,
  refreshNovelties,
  isLoading: noveltiesLoading,
  hasError: noveltiesHasError,
  isEmpty: noveltiesIsEmpty,
  canRetry: noveltiesCanRetry
} = useNoveltiesCache();

// Методы для обработки действий пользователя
const handleRefresh = async () => {
  console.log('[BookNovelties] Принудительное обновление новинок...');
  const success = await refreshNovelties(props.limit);
  if (success) {
    console.log('[BookNovelties] Новинки успешно обновлены');
  }
};



const handleRetry = async () => {
  console.log('[BookNovelties] Повторная попытка загрузки...');
  await handleRefresh();
// Навигация к книге
const navigateToBook = (book: Book) => {
  navigateTo(`/book/${book.id}`);
};

// Утилиты для форматирования
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Сегодня';
  if (diffDays === 1) return 'Вчера';
  if (diffDays < 7) return `${diffDays} дн. назад`;

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    progress: 'В процессе',
    done: 'Завершена',
    frozen: 'Заморожена',
    discarded: 'Отменена',
  };
  return labels[status] || status;
};

const getStatusClass = (status: string) => {
  const classes: Record<string, string> = {
    progress: 'bg-blue-100 text-blue-800',
    done: 'bg-green-100 text-green-800',
    frozen: 'bg-yellow-100 text-yellow-800',
    discarded: 'bg-red-100 text-red-800',
  };
  return classes[status] || 'bg-gray-100 text-gray-800';
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
