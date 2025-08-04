/**
 * Простая система кэширования в памяти для новинок
 */

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 минут в миллисекундах
  }

  /**
   * Получить значение из кэша
   * @param {string} key - ключ кэша
   * @returns {any|null} значение или null если не найдено/истекло
   */
  get(key) {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    // Проверяем не истек ли TTL
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Сохранить значение в кэш
   * @param {string} key - ключ кэша
   * @param {any} value - значение для сохранения
   * @param {number} ttl - время жизни в миллисекундах (опционально)
   */
  set(key, value, ttl = this.defaultTTL) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  /**
   * Удалить значение из кэша
   * @param {string} key - ключ кэша
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Очистить весь кэш
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Получить размер кэша
   * @returns {number} количество элементов в кэше
   */
  size() {
    return this.cache.size;
  }

  /**
   * Очистить истекшие элементы
   */
  cleanup() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Получить статистику кэша
   * @returns {object} статистика кэша
   */
  getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;

    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        expired++;
      } else {
        active++;
      }
    }

    return {
      total: this.cache.size,
      active,
      expired,
      memoryUsage: this.estimateMemoryUsage(),
    };
  }

  /**
   * Примерная оценка использования памяти
   * @returns {number} размер в байтах (приблизительно)
   */
  estimateMemoryUsage() {
    let size = 0;
    for (const [key, item] of this.cache.entries()) {
      size += key.length * 2; // строки в UTF-16
      size += JSON.stringify(item.value).length * 2;
      size += 16; // примерный размер объекта item
    }
    return size;
  }
}

// Создаем глобальный экземпляр кэша
const noveltiesCache = new MemoryCache();

// Автоматическая очистка отключена - кэш очищается вручную при необходимости

/**
 * Генерирует ключ кэша для новинок
 * @param {number} offset - смещение
 * @param {number} limit - лимит
 * @param {boolean} manual - ручная ротация
 * @returns {string} ключ кэша
 */
export const generateCacheKey = (offset, limit, manual = true) => {
  // Всегда используем ручную ротацию
  return `novelties:manual:${offset}:${limit}`;
};

/**
 * Получить новинки из кэша или выполнить функцию
 * @param {string} cacheKey - ключ кэша
 * @param {Function} fetchFunction - функция для получения данных
 * @param {number} ttl - время жизни кэша (опционально)
 * @returns {Promise<any>} результат
 */
export const getCachedNovelties = async (
  cacheKey,
  fetchFunction,
  ttl = 5 * 60 * 1000,
) => {
  // Пытаемся получить из кэша
  const cached = noveltiesCache.get(cacheKey);
  if (cached) {
    return {
      ...cached,
      fromCache: true,
      cacheKey,
    };
  }

  // Если нет в кэше, выполняем функцию
  const result = await fetchFunction();

  // Сохраняем в кэш
  noveltiesCache.set(cacheKey, result, ttl);

  return {
    ...result,
    fromCache: false,
    cacheKey,
  };
};

/**
 * Инвалидировать кэш новинок
 * @param {string} pattern - паттерн для удаления (опционально)
 */
export const invalidateNoveltiesCache = (pattern = null) => {
  if (!pattern) {
    // Удаляем все кэши новинок
    for (const key of noveltiesCache.cache.keys()) {
      if (key.startsWith('novelties:')) {
        noveltiesCache.delete(key);
      }
    }
  } else {
    // Удаляем по паттерну
    for (const key of noveltiesCache.cache.keys()) {
      if (key.includes(pattern)) {
        noveltiesCache.delete(key);
      }
    }
  }
};

/**
 * Получить статистику кэша новинок
 * @returns {object} статистика
 */
export const getNoveltiesCacheStats = () => {
  const stats = noveltiesCache.getStats();
  const noveltiesKeys = Array.from(noveltiesCache.cache.keys()).filter((key) =>
    key.startsWith('novelties:'),
  );

  return {
    ...stats,
    noveltiesEntries: noveltiesKeys.length,
    noveltiesKeys: noveltiesKeys,
  };
};

// Экспорт экземпляра кэша для прямого использования
export { noveltiesCache };

// Хелперы для работы с кэшем
export const cacheHelpers = {
  /**
   * Кэшированный вызов функции
   * @param {string} key - ключ кэша
   * @param {Function} fn - функция для выполнения
   * @param {number} ttl - время жизни
   * @returns {Promise<any>} результат
   */
  cached: async (key, fn, ttl = 5 * 60 * 1000) => {
    return getCachedNovelties(key, fn, ttl);
  },

  /**
   * Предварительная загрузка в кэш
   * @param {string} key - ключ кэша
   * @param {Function} fn - функция для выполнения
   * @param {number} ttl - время жизни
   */
  preload: async (key, fn, ttl = 5 * 60 * 1000) => {
    if (!noveltiesCache.get(key)) {
      const result = await fn();
      noveltiesCache.set(key, result, ttl);
    }
  },

  /**
   * Обновить кэш в фоне
   * @param {string} key - ключ кэша
   * @param {Function} fn - функция для выполнения
   * @param {number} ttl - время жизни
   */
  refresh: async (key, fn, ttl = 5 * 60 * 1000) => {
    try {
      const result = await fn();
      noveltiesCache.set(key, result, ttl);
    } catch (error) {
      console.error('Error refreshing cache:', error);
    }
  },
};
