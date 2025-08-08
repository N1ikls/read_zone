<script setup lang="ts">
import { RCard, RHeader } from '@/components';
import { ItemThing, ItemFilters, ItemCarousel } from '@/entities/main';
import type { Book } from '~/shared/types';

// Отключаем кэширование страницы для обеспечения актуальности новинок
useHead({
  meta: [
    {
      'http-equiv': 'Cache-Control',
      'content': 'no-cache, no-store, must-revalidate',
    },
    { 'http-equiv': 'Pragma', 'content': 'no-cache' },
    { 'http-equiv': 'Expires', 'content': '0' },
  ],
});

useSeoMeta({
  title: 'ReadZone - Главная',
  description: 'Добро пожаловать в ReadZone - платформу для чтения книг',
});

interface RotationInfo {
  currentOffset: number;
  totalPages: number;
  currentPage: number;
  nextRotationIn: number;
  isRotating: boolean;
  isManual: boolean;
  rotationIntervalMinutes: number;
}

interface NoveltiesData {
  books: Book[];
  total: number;
  offset: number;
  hasMore: boolean;
}

interface NoveltiesResponse {
  success: boolean;
  data: NoveltiesData;
  meta: {
    rotation: RotationInfo;
    cache?: {
      fromCache: boolean;
      cacheKey: string;
    };
  };
  message?: string;
  timestamp?: string;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

// Constants
const NOVELTIES_LIMIT = 4 as const;
const DEFAULT_LIMIT = 4 as const;
const MAX_RETRY_ATTEMPTS = 3 as const;

// Reactive state
const limit = ref<number>(DEFAULT_LIMIT);
const noveltiesLimit = ref<number>(NOVELTIES_LIMIT);

// Novelties state with proper typing
const noveltiesBooks = ref<Book[]>([]);
const loadingState = ref<LoadingState>({
  isLoading: false,
  error: null,
  lastUpdated: null,
});

const rotationInfo = ref<RotationInfo>({
  currentOffset: 0,
  isRotating: false,
  currentPage: 1,
  totalPages: 1,
  nextRotationIn: 0,
  isManual: true, // Всегда ручная ротация
  rotationIntervalMinutes: 0, // Отключено автообновление
});

let retryAttempts = 0;

// Utility functions - убраны таймеры

const validateBook = (book: any): book is Book => {
  return (
    book &&
    typeof book.id === 'string' &&
    typeof book.name === 'string' &&
    Array.isArray(book.genres)
  );
};

const validateNoveltiesResponse = (
  response: any,
): response is NoveltiesResponse => {
  return (
    response &&
    typeof response.success === 'boolean' &&
    response.data &&
    Array.isArray(response.data.books) &&
    response.meta &&
    response.meta.rotation
  );
};

// Enhanced loading function with proper error handling
const loadNovelties = async (
  offset: number | null = null,
  manual = false,
  isRetry = false,
): Promise<void> => {
  try {
    // Prevent concurrent requests
    if (loadingState.value.isLoading && !isRetry) {
      console.warn('Загрузка новинок уже выполняется');
      return;
    }

    loadingState.value.isLoading = true;
    loadingState.value.error = null;

    // Validate input parameters
    if (offset !== null && (offset < 0 || !Number.isInteger(offset))) {
      throw new Error('Некорректное значение offset');
    }

    const params = new URLSearchParams({
      limit: Math.max(1, Math.min(noveltiesLimit.value, 20)).toString(),
      // Добавляем timestamp для принудительного обновления
      _t: Date.now().toString(),
    });

    if (offset !== null) {
      params.append('offset', offset.toString());
    }

    if (manual) {
      params.append('manual', 'true');
    }

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response: NoveltiesResponse = await $fetch(
        `/api/books/novelties?${params}`,
        {
          signal: controller.signal,
        },
      );

      clearTimeout(timeoutId);

      // Validate response structure
      if (!validateNoveltiesResponse(response)) {
        throw new Error('Некорректный формат ответа сервера');
      }

      if (!response.success) {
        throw new Error(response.message || 'Сервер вернул ошибку');
      }

      // Validate and filter books
      const validBooks = response.data.books.filter(validateBook);

      if (validBooks.length !== response.data.books.length) {
        console.warn(
          'Некоторые книги имеют некорректный формат и были исключены',
        );
      }

      // Update state
      noveltiesBooks.value = validBooks;
      rotationInfo.value = { ...response.meta.rotation };
      loadingState.value.lastUpdated = new Date();
      retryAttempts = 0; // Reset retry counter on success

      // Автоматическое обновление отключено - ротация только при обновлении страницы
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (error: unknown) {
    console.error('Ошибка загрузки новинок:', error);

    let errorMessage = 'Произошла неизвестная ошибка';

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        errorMessage = 'Превышено время ожидания ответа сервера';
      } else if (error.message.includes('fetch')) {
        errorMessage = 'Ошибка сети. Проверьте подключение к интернету';
      } else {
        errorMessage = error.message;
      }
    }

    loadingState.value.error = errorMessage;

    // Auto-retry logic with exponential backoff
    if (retryAttempts < MAX_RETRY_ATTEMPTS && !manual) {
      retryAttempts++;
      const retryDelay = Math.min(1000 * Math.pow(2, retryAttempts - 1), 10000);

      console.log(
        `Повторная попытка ${retryAttempts}/${MAX_RETRY_ATTEMPTS} через ${retryDelay}ms`,
      );

      setTimeout(() => {
        loadNovelties(offset, manual, true);
      }, retryDelay);
    }
  } finally {
    loadingState.value.isLoading = false;
  }
};

// Автоматическое обновление отключено

// Time formatting utility with validation
const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) {
    return '0:00';
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Автоматическая ротация отключена

// Manual retry function for user interaction
const retryLoadNovelties = (): void => {
  retryAttempts = 0; // Reset retry counter for manual retry
  loadNovelties(null, true).catch((error) => {
    console.error('Ошибка ручной перезагрузки:', error);
  });
};

// Computed properties for template
const isLoading = computed(() => loadingState.value.isLoading);
const hasError = computed(() => !!loadingState.value.error);
const errorMessage = computed(() => loadingState.value.error);

// Определяем какие книги показывать - новинки или fallback
const displayBooks = computed(() => {
  if (noveltiesBooks.value.length > 0) {
    return noveltiesBooks.value;
  }
  // Fallback к обычным новостям только если новинки не загружены
  return news.value || [];
});

// Lifecycle hooks - удалено, так как теперь используется новый composable

// Production-ready управление новинками
const {
  state: noveltiesState,
  refreshNovelties,
  isLoading: noveltiesLoading,
  hasError: noveltiesHasError,
  isEmpty: noveltiesIsEmpty,
  canRetry: noveltiesCanRetry,
} = useNovelties();

// Остальные данные с оптимизированным кэшированием
const { data: news } = useFetch<Book[]>('/api/new', {
  key: 'news-data',
  query: { limit },
  default: () => [],
  server: false,
});

const { data } = useFetch<Book[]>('/api/slider-books', {
  key: 'slider-books-data',
  default: () => [],
  server: false,
  lazy: true,
});

const { data: read } = useFetch('/api/currently-reading', {
  key: 'currently-reading-data',
  query: { limit: 5 },
  default: () => [],
  server: false,
  // Обновление выполняется вручную через возвращаемый метод refresh() при необходимости
});
const { data: top } = useFetch('/api/top-genres', {
  key: 'top-genres',
  default: () => [],
});

// Популярные жанры: показать больше/меньше и переход по жанрам
const showAllTopGenres = ref(false);
const topGenres = computed(() => (Array.isArray(top.value) ? top.value : []));
const topGenresToShow = computed(() =>
  showAllTopGenres.value ? topGenres.value : topGenres.value.slice(0, 4),
);
const getGenreCover = (genre: any) =>
  genre?.recent_books?.[0]?.cover || '/test_banner_2.png';
const buildGenreLink = (id: string | number) => `/catalog?genres=${id}`;
const toggleShowGenres = () => {
  showAllTopGenres.value = !showAllTopGenres.value;
};

// Инициализация новинок при загрузке страницы
onMounted(async () => {
  console.log('[Index] Инициализация новинок...');
  await loadNovelties(); // Автоматическая ротация без указания offset
  console.log('[Index] Новинки загружены:', noveltiesBooks.value.length);
});

// Обновление новинок при каждом возвращении на страницу
onActivated(async () => {
  console.log('[Index] Страница активирована, обновляем новинки...');
  await loadNovelties(); // Автоматическая ротация без указания offset
});
</script>

<template>
  <div class="light:bg-[#E0EAFF] min-h-screen pt-4">
    <div class="wrapper">
      <section aria-label="Карусель рекомендуемых книг">
        <item-carousel :items="data" />
      </section>

      <section
        class="news mt-4"
        aria-label="Новинки и популярные книги"
      >
        <div class="grid mt-8">
          <article
            class="grid__news"
            role="region"
            aria-labelledby="novelties-heading"
          >
            <!-- Заголовок с информацией о новинках -->
            <header class="novelties-header">
              <div class="novelties-header__main">
                <div
                  class="text-[#003386] text-[70px] !font-(family-name:--font-aspa)"
                >
                  Новинки
                </div>
                <p
                  class="novelties-subtitle"
                  id="novelties-description"
                >
                  Свежие книги за последние 7 дней
                </p>
              </div>

              <!-- Индикатор загрузки -->
              <div
                v-if="isLoading"
                class="loading-indicator"
                role="status"
                aria-label="Загрузка новинок"
              >
                <svg
                  class="animate-spin h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span class="sr-only">Загрузка новинок...</span>
              </div>
            </header>

            <!-- Ошибка загрузки -->
            <div
              v-if="hasError"
              class="error-message"
              role="alert"
              aria-live="assertive"
            >
              <svg
                class="w-5 h-5 text-red-500 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {{ errorMessage }}
              <button
                @click="retryLoadNovelties()"
                class="retry-button"
                type="button"
                aria-label="Повторить загрузку новинок"
                :disabled="isLoading"
              >
                {{ isLoading ? 'Загрузка...' : 'Повторить' }}
              </button>
            </div>

            <!-- Новинки или fallback к обычным новостям -->
            <div
              v-if="!hasError"
              class="novelties-list"
              role="list"
              aria-describedby="novelties-description"
            >
              <div
                v-for="(item, key) in displayBooks"
                :key="item.id || key"
                class="grid-item"
                role="listitem"
              >
                <ItemThing
                  :item="item"
                  :clickable="true"
                />
                <div class="grid-item__border" />
              </div>
            </div>

            <!-- Автоматическое обновление отключено -->
          </article>

          <aside
            class="grid__read-now"
            role="complementary"
            aria-labelledby="reading-now-heading"
          >
            <div
              class="text-[#003386] text-[40px] !font-(family-name:--font-aspa) px-[35px] py-5 leading-8"
            >
              Сейчас читают
            </div>

            <div
              class="reading-now-list"
              role="list"
              aria-label="Список книг, которые сейчас читают"
            >
              <div
                v-for="(item, key) in read"
                :key="key"
                class="grid__read-now-item"
                role="listitem"
              >
                <ItemThing
                  :item="item"
                  :clickable="true"
                />
              </div>
            </div>
          </aside>
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
          Популярные жанры
        </r-header>

        <div class="genres__list">
          <r-banner
            v-for="genre in topGenresToShow"
            :key="genre.id"
            :cover="getGenreCover(genre)"
            :subtitle="`Более ${genre.books_count || 0} манг`"
            :to="buildGenreLink(genre.id)"
          >
            {{ genre.name }}
          </r-banner>
        </div>

        <div class="flex gap-3">
          <u-button
            color="info"
            size="lg"
            class="text-[18px] font-bold rounded-[10px] flex-1"
            @click="toggleShowGenres"
          >
            {{ showAllTopGenres ? 'Показать меньше' : 'Больше' }}
          </u-button>

          <u-button
            color="info"
            size="lg"
            class="text-[18px] font-bold rounded-[10px] flex-1"
            to="/catalog"
          >
            Перейти в каталог
          </u-button>
        </div>
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

// Стили для новинок
.novelties-header {
  padding: 20px 35px 10px 35px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 10px;

  &__main {
    flex: 1;
  }
}

.novelties-title {
  margin-bottom: 8px;
  font-size: 32px;
  font-weight: 700;
}

.novelties-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

.update-info {
  color: #059669;
  font-weight: 500;
}

.loading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
}

.error-message {
  display: flex;
  align-items: center;
  padding: 16px 35px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin: 0 20px 20px 20px;
  color: #dc2626;
  font-size: 14px;
}

.retry-button {
  margin-left: 12px;
  padding: 4px 12px;
  background-color: #dc2626;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 80px;

  &:hover:not(:disabled) {
    background-color: #b91c1c;
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid #dc2626;
    outline-offset: 2px;
  }

  &:disabled {
    background-color: #9ca3af;
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }
}

.auto-update-info {
  padding: 16px 35px;
  text-align: center;
  border-top: 1px solid #e5e7eb;
  margin-top: 10px;
}

// Screen reader only content
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

// Focus management
.novelties-list:focus-within,
.reading-now-list:focus-within {
  outline: 2px solid #0862e0;
  outline-offset: 2px;
  border-radius: 4px;
}

// High contrast mode support
@media (prefers-contrast: high) {
  .novelties-header {
    border-bottom-color: #000;
  }

  .update-info {
    color: #000;
    font-weight: 700;
  }

  .error-message {
    border-color: #000;
    background-color: #fff;
    color: #000;
  }

  .retry-button {
    background-color: #000;
    color: #fff;
    border: 2px solid #000;
  }
}

// Адаптивность
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .novelties-header {
    flex-direction: column;
    gap: 12px;
    padding: 16px 20px;
  }

  .novelties-title {
    font-size: 24px;
  }

  .grid-item {
    padding: 20px 20px 0 20px;
  }

  .grid__actions {
    padding: 20px 16px;
  }

  .grid__read-now {
    &__title {
      font-size: 28px;
      padding: 16px 20px;
    }

    &-item {
      padding: 0 20px 20px 20px;
    }
  }

  .error-message {
    margin: 0 16px 16px 16px;
    padding: 12px 16px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .auto-update-info {
    padding: 12px 20px;
  }
}

// Дополнительная адаптивность для очень маленьких экранов
@media (max-width: 480px) {
  .novelties-title {
    font-size: 20px;
  }

  .novelties-subtitle {
    font-size: 12px;
  }

  .grid__read-now__title {
    font-size: 24px;
  }

  .loading-indicator {
    padding: 4px;
  }

  .retry-button {
    padding: 6px 16px;
    font-size: 14px;
  }
}

// Улучшения для планшетов
@media (min-width: 769px) and (max-width: 1024px) {
  .grid {
    gap: 24px;
  }

  .novelties-title {
    font-size: 28px;
  }

  .grid__read-now__title {
    font-size: 36px;
  }
}
</style>
