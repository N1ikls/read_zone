/**
 * Production-ready composable для управления новинками
 * Обеспечивает надежную ротацию, обработку ошибок и оптимальную производительность
 */

import type { Book } from '~/shared/types';
import { reactive, computed, readonly } from 'vue';

interface NoveltiesState {
  books: Book[];
  total: number;
  offset: number;
  hasMore: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  retryCount: number;
}

interface NoveltiesResponse {
  success: boolean;
  data: {
    books: Book[];
    total: number;
    offset: number;
    hasMore: boolean;
  };
  meta: {
    rotation: {
      currentOffset: number;
      totalPages: number;
      currentPage: number;
      isRotating: boolean;
    };
  };
  message?: string;
  timestamp?: string;
}

const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 1000; // 1 секунда
const REQUEST_TIMEOUT = 10000; // 10 секунд

export const useNovelties = () => {
  // Reactive состояние
  const state = reactive<NoveltiesState>({
    books: [],
    total: 0,
    offset: 0,
    hasMore: false,
    isLoading: false,
    error: null,
    lastUpdated: null,
    retryCount: 0,
  });

  // Флаг для предотвращения дублирования запросов
  let isRequestInProgress = false;

  /**
   * Задержка для retry логики
   */
  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * Валидация ответа API
   */
  const validateResponse = (response: any): response is NoveltiesResponse => {
    return (
      response &&
      typeof response === 'object' &&
      typeof response.success === 'boolean' &&
      response.data &&
      Array.isArray(response.data.books) &&
      typeof response.data.total === 'number'
    );
  };

  /**
   * Логирование ошибок для мониторинга
   */
  const logError = (error: any, context: string) => {
    console.error(`[Novelties] ${context}:`, {
      error: error.message || error,
      timestamp: new Date().toISOString(),
      retryCount: state.retryCount,
      lastOffset: state.offset,
    });
  };

  /**
   * Основная функция загрузки новинок с retry логикой
   */
  const fetchNovelties = async (
    limit: number = 4,
    forceRefresh: boolean = true,
  ): Promise<boolean> => {
    // Предотвращаем дублирование запросов
    if (isRequestInProgress) {
      console.warn('[Novelties] Загрузка новинок уже выполняется');
      return false;
    }

    isRequestInProgress = true;
    state.isLoading = true;
    state.error = null;

    try {
      // Создаем контроллер для отмены запроса по таймауту
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

      // Формируем URL с параметрами для принудительного обновления
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (forceRefresh) {
        params.append('_t', Date.now().toString());
      }

      const response = await $fetch<NoveltiesResponse>(
        `/api/books/novelties?${params}`,
        {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        },
      );

      clearTimeout(timeoutId);

      // Валидируем ответ
      if (!validateResponse(response)) {
        throw new Error('Некорректный формат ответа сервера');
      }

      if (!response.success) {
        throw new Error(response.message || 'Сервер вернул ошибку');
      }

      // Обновляем состояние
      state.books = response.data.books;
      state.total = response.data.total;
      state.offset = response.data.offset;
      state.hasMore = response.data.hasMore;
      state.lastUpdated = new Date();
      state.retryCount = 0;

      return true;
    } catch (error: any) {
      logError(error, 'fetchNovelties');

      // Retry логика
      if (
        state.retryCount < MAX_RETRY_ATTEMPTS &&
        !error.name?.includes('AbortError')
      ) {
        state.retryCount++;
        console.log(
          `[Novelties] Повторная попытка ${state.retryCount}/${MAX_RETRY_ATTEMPTS}`,
        );

        await delay(RETRY_DELAY * state.retryCount); // Экспоненциальная задержка

        isRequestInProgress = false;
        return await fetchNovelties(limit, forceRefresh);
      }

      // Устанавливаем ошибку после исчерпания попыток
      state.error = error.message || 'Произошла ошибка при загрузке новинок';
      return false;
    } finally {
      state.isLoading = false;
      isRequestInProgress = false;
    }
  };

  /**
   * Принудительное обновление новинок
   */
  const refreshNovelties = async (limit: number = 4) => {
    console.log('[Novelties] Принудительное обновление новинок, limit:', limit);
    const result = await fetchNovelties(limit, true);
    console.log(
      '[Novelties] Результат обновления:',
      result,
      'Книг загружено:',
      state.books.length,
    );
    return result;
  };

  /**
   * Очистка состояния
   */
  const clearState = () => {
    state.books = [];
    state.total = 0;
    state.offset = 0;
    state.hasMore = false;
    state.error = null;
    state.lastUpdated = null;
    state.retryCount = 0;
  };

  return {
    // Reactive состояние
    state: readonly(state),

    // Методы
    fetchNovelties,
    refreshNovelties,
    clearState,

    // Computed свойства
    isLoading: computed(() => state.isLoading),
    hasError: computed(() => !!state.error),
    isEmpty: computed(() => state.books.length === 0 && !state.isLoading),
    canRetry: computed(() => state.retryCount < MAX_RETRY_ATTEMPTS),
  };
};
