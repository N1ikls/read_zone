export default defineApiHandler(async (event) => {
  try {
    const storage = event.context.storage;

    // Проверим что storage доступен
    if (!storage || !storage.book) {
      return {
        success: false,
        message: 'Storage не доступен',
        data: { books: [], total: 0, offset: 0, hasMore: false },
      };
    }

    // Проверим что метод getNovelties существует
    if (typeof storage.book.getNovelties !== 'function') {
      return {
        success: false,
        message: 'Метод getNovelties не найден',
        data: { books: [], total: 0, offset: 0, hasMore: false },
      };
    }

    // Парсим параметры запроса
    const query = getQuery(event);
    const { offset = 0, limit = 6, manual = false } = query;

    const parsedOffset = Math.max(0, parseInt(offset as string) || 0);
    const parsedLimit = Math.min(parseInt(limit as string) || 6, 12);
    const isManual = manual === 'true' || manual === true;

    // Вызываем метод getNovelties
    const result = await storage.book.getNovelties(parsedOffset, parsedLimit);

    // Простая ротация на основе времени
    const now = Date.now();
    const rotationInterval = 5 * 60 * 1000; // 5 минут
    const rotationCycles = Math.floor(now / rotationInterval);
    const totalPages = Math.ceil(result.total / parsedLimit);
    const currentPage = totalPages > 0 ? (rotationCycles % totalPages) + 1 : 1;
    const nextRotationIn = Math.ceil(
      (rotationInterval - (now % rotationInterval)) / 1000,
    );

    return {
      success: true,
      message: 'Новинки получены успешно',
      timestamp: new Date().toISOString(),
      data: {
        books: result.books || [],
        total: result.total || 0,
        offset: result.offset || parsedOffset,
        hasMore: result.hasMore || false,
      },
      meta: {
        offset: result.offset || parsedOffset,
        limit: parsedLimit,
        total: result.total || 0,
        hasMore: result.hasMore || false,
        nextOffset: result.nextOffset || 0,
        rotation: {
          currentOffset: result.offset || parsedOffset,
          totalPages,
          currentPage,
          nextRotationIn,
          isRotating: totalPages > 1,
          isManual,
          rotationIntervalMinutes: 5,
        },
        cache: {
          fromCache: false,
          cacheKey: `novelties:${isManual ? 'manual' : 'auto'}:${parsedOffset}:${parsedLimit}`,
        },
      },
    };
  } catch (error: any) {
    console.error('Error in novelties API:', error);
    return {
      success: false,
      message:
        'Ошибка получения новинок: ' + (error.message || 'Неизвестная ошибка'),
      data: { books: [], total: 0, offset: 0, hasMore: false },
    };
  }
});
