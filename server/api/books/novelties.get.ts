import { RotationManager } from '../../services/RotationManager.js';

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
    const { offset, limit = 4, manual, reset } = query;

    const parsedLimit = Math.min(parseInt(limit as string) || 4, 12);

    // Инициализируем RotationManager
    const rotationManager = new RotationManager(storage.knex);

    // Сначала получаем общее количество новинок
    const initialResult = await storage.book.getNovelties(0, parsedLimit);
    const totalItems = initialResult.total;

    let rotationOffset = 0;
    let cycleInfo: any = {};

    // Если запрошен сброс ротации (для админов)
    if (reset === 'true') {
      await rotationManager.resetRotation('novelties');
      console.log('[Novelties API] Rotation reset requested');
    }

    // Если offset не указан явно (автоматическая циклическая ротация)
    if (offset === undefined || offset === null || offset === '') {
      if (totalItems > 0) {
        // Получаем следующий offset из циклической ротации
        const rotationResult = await rotationManager.getNextOffset(
          'novelties',
          totalItems,
          parsedLimit,
        );
        rotationOffset = rotationResult.offset;
        cycleInfo = rotationResult.cycleInfo;

        console.log(
          `[Novelties API] Cyclic rotation: offset=${rotationOffset}, cycle=${cycleInfo.cycleCount}, page=${cycleInfo.currentPage}/${cycleInfo.totalPages}`,
        );
      }
    } else {
      // Используем указанный offset (ручная навигация)
      rotationOffset = Math.max(0, parseInt(offset as string) || 0);
      console.log(`[Novelties API] Manual offset: ${rotationOffset}`);
    }

    // Получаем книги с рассчитанным offset
    let result = await storage.book.getNovelties(rotationOffset, parsedLimit);

    // Если нужно циклическое заполнение (когда достигли конца списка)
    if (cycleInfo.needsCyclicFill && result.books.length < parsedLimit) {
      const remainingLimit = parsedLimit - result.books.length;
      const additionalResult = await storage.book.getNovelties(
        0,
        remainingLimit,
      );

      result.books = [...result.books, ...additionalResult.books];
      console.log(
        `[Novelties API] Cyclic fill: added ${additionalResult.books.length} books from start`,
      );
    }

    const totalPages = Math.ceil(totalItems / parsedLimit);

    return {
      success: true,
      message: 'Новинки получены успешно',
      timestamp: new Date().toISOString(),
      data: {
        books: result.books || [],
        total: totalItems,
        offset: rotationOffset,
        hasMore: result.hasMore || false,
      },
      meta: {
        offset: rotationOffset,
        limit: parsedLimit,
        total: totalItems,
        hasMore: result.hasMore || false,
        nextOffset: result.nextOffset || 0,
        rotation: {
          currentOffset: rotationOffset,
          totalPages,
          currentPage: Math.floor(rotationOffset / parsedLimit) + 1,
          isRotating: totalPages > 1,
          isManual: manual === 'true',
          isCyclic: offset === undefined || offset === null || offset === '',
          cycleInfo: cycleInfo || {},
        },
        cache: {
          fromCache: false,
          cacheKey: `novelties:${manual === 'true' ? 'manual' : 'cyclic'}:${rotationOffset}:${parsedLimit}`,
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
