/**
 * Утилита для детерминированной ротации новинок
 * Обеспечивает циклическую смену книг на основе времени
 */

export class NoveltyRotation {
  constructor(rotationIntervalMinutes = 5) {
    this.rotationIntervalMinutes = rotationIntervalMinutes;
    this.rotationIntervalMs = rotationIntervalMinutes * 60 * 1000;
  }

  /**
   * Вычисляет offset для ротации на основе текущего времени
   * @param {number} totalItems - общее количество новинок
   * @param {number} itemsPerPage - количество элементов на странице
   * @returns {number} offset для текущего момента времени
   */
  getTimeBasedOffset(totalItems, itemsPerPage = 6) {
    if (totalItems === 0) return 0;

    // Получаем текущее время в миллисекундах
    const now = Date.now();
    
    // Вычисляем количество интервалов ротации с начала эпохи
    const rotationCycles = Math.floor(now / this.rotationIntervalMs);
    
    // Вычисляем количество "страниц" новинок
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // Определяем текущую "страницу" с циклической ротацией
    const currentPage = rotationCycles % totalPages;
    
    // Вычисляем offset
    const offset = currentPage * itemsPerPage;
    
    return Math.min(offset, totalItems - 1);
  }

  /**
   * Получает информацию о текущей ротации
   * @param {number} totalItems - общее количество новинок
   * @param {number} itemsPerPage - количество элементов на странице
   * @returns {object} информация о ротации
   */
  getRotationInfo(totalItems, itemsPerPage = 6) {
    if (totalItems === 0) {
      return {
        currentOffset: 0,
        totalPages: 0,
        currentPage: 0,
        nextRotationIn: 0,
        isRotating: false
      };
    }

    const now = Date.now();
    const rotationCycles = Math.floor(now / this.rotationIntervalMs);
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = rotationCycles % totalPages;
    const currentOffset = this.getTimeBasedOffset(totalItems, itemsPerPage);
    
    // Время до следующей ротации
    const nextRotationTime = (rotationCycles + 1) * this.rotationIntervalMs;
    const nextRotationIn = Math.max(0, nextRotationTime - now);

    return {
      currentOffset,
      totalPages,
      currentPage: currentPage + 1, // Человекочитаемый номер страницы (с 1)
      nextRotationIn: Math.ceil(nextRotationIn / 1000), // в секундах
      nextRotationInMs: nextRotationIn,
      isRotating: totalPages > 1,
      rotationIntervalMinutes: this.rotationIntervalMinutes
    };
  }

  /**
   * Получает следующий offset для ручной ротации
   * @param {number} currentOffset - текущий offset
   * @param {number} totalItems - общее количество новинок
   * @param {number} itemsPerPage - количество элементов на странице
   * @returns {number} следующий offset
   */
  getNextOffset(currentOffset, totalItems, itemsPerPage = 6) {
    if (totalItems === 0) return 0;
    
    const nextOffset = currentOffset + itemsPerPage;
    return nextOffset >= totalItems ? 0 : nextOffset;
  }

  /**
   * Получает предыдущий offset для ручной ротации
   * @param {number} currentOffset - текущий offset
   * @param {number} totalItems - общее количество новинок
   * @param {number} itemsPerPage - количество элементов на странице
   * @returns {number} предыдущий offset
   */
  getPreviousOffset(currentOffset, totalItems, itemsPerPage = 6) {
    if (totalItems === 0) return 0;
    
    if (currentOffset === 0) {
      // Переходим к последней "странице"
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      return (totalPages - 1) * itemsPerPage;
    }
    
    return Math.max(0, currentOffset - itemsPerPage);
  }

  /**
   * Создает детерминированный offset на основе даты (для кэширования)
   * @param {number} totalItems - общее количество новинок
   * @param {number} itemsPerPage - количество элементов на странице
   * @param {Date} date - дата для расчета (по умолчанию текущая)
   * @returns {number} offset для указанной даты
   */
  getDeterministicOffset(totalItems, itemsPerPage = 6, date = new Date()) {
    if (totalItems === 0) return 0;

    // Используем день года и час для создания детерминированного offset
    const dayOfYear = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const hour = date.getHours();
    const rotationPeriod = Math.floor(hour / (this.rotationIntervalMinutes / 60));
    
    const seed = dayOfYear * 100 + rotationPeriod;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pageIndex = seed % totalPages;
    
    return pageIndex * itemsPerPage;
  }

  /**
   * Получает статистику ротации для аналитики
   * @param {number} totalItems - общее количество новинок
   * @param {number} itemsPerPage - количество элементов на странице
   * @returns {object} статистика ротации
   */
  getRotationStats(totalItems, itemsPerPage = 6) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const rotationsPerDay = Math.floor((24 * 60) / this.rotationIntervalMinutes);
    const daysToShowAll = totalPages / rotationsPerDay;

    return {
      totalItems,
      itemsPerPage,
      totalPages,
      rotationIntervalMinutes: this.rotationIntervalMinutes,
      rotationsPerDay,
      daysToShowAllPages: Math.ceil(daysToShowAll),
      estimatedViewsPerItem: rotationsPerDay / totalPages
    };
  }
}

// Экспорт экземпляра с настройками по умолчанию
export const defaultRotation = new NoveltyRotation(5); // Ротация каждые 5 минут

// Экспорт функций-хелперов
export const getTimeBasedOffset = (totalItems, itemsPerPage = 6) => {
  return defaultRotation.getTimeBasedOffset(totalItems, itemsPerPage);
};

export const getRotationInfo = (totalItems, itemsPerPage = 6) => {
  return defaultRotation.getRotationInfo(totalItems, itemsPerPage);
};

export const getNextOffset = (currentOffset, totalItems, itemsPerPage = 6) => {
  return defaultRotation.getNextOffset(currentOffset, totalItems, itemsPerPage);
};
