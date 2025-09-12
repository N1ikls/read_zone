export default defineApiHandler(async (event: any) => {
  try {
    const storage = event.context.storage;
    const user = await event.context.context.user();

    // Проверим что storage доступен
    if (!storage || !storage.team) {
      return {
        success: false,
        message: 'Storage не доступен',
        data: { books: [], total: 0 },
      };
    }

    // Получаем ID команды из параметров маршрута
    const teamId = getRouterParam(event, 'id');
    if (!teamId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID команды обязателен',
      });
    }

    // Парсим параметры запроса
    const query = getQuery(event);
    const {
      offset = 0,
      limit = 20,
      sort = 'created_at',
      order = 'desc',
      filters,
    } = query;

    const parsedOffset = Math.max(0, parseInt(offset as string) || 0);
    const parsedLimit = Math.min(parseInt(limit as string) || 20, 100);

    // Парсим фильтры
    let parsedFilters: any = {};
    if (filters) {
      try {
        parsedFilters = typeof filters === 'string' ? JSON.parse(filters) : filters;
      } catch (error) {
        console.warn('Ошибка парсинга фильтров:', error);
        parsedFilters = {};
      }
    }

    // Находим команду
    const team = await storage.team.findOne({ id: teamId });
    if (!team) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Команда не найдена',
      });
    }

    // Получаем query builder для книг команды
    let booksQuery = await storage.team.getBooks(team, true);

    // Применяем фильтрацию по типам через ORM
    if (parsedFilters.types && Array.isArray(parsedFilters.types) && parsedFilters.types.length > 0) {
      booksQuery = booksQuery.whereIn('book.type', parsedFilters.types);
    }

    // Применяем сортировку через ORM
    const validSortFields = ['created_at', 'updated_at', 'name', 'rate', 'viewers_count', 'chapters_count'];
    const sortField = validSortFields.includes(sort as string) ? sort as string : 'created_at';
    const sortOrder = order === 'asc' ? 'asc' : 'desc';

    booksQuery = booksQuery.orderBy(`book.${sortField}`, sortOrder);

    // Получаем общее количество для пагинации (клонируем запрос для подсчёта)
    const countQuery = booksQuery.clone().clearSelect().clearOrder().count('* as count').first();
    const totalResult = await countQuery;
    const total = parseInt(totalResult.count);

    // Применяем пагинацию через ORM
    const paginatedBooks = await booksQuery.offset(parsedOffset).limit(parsedLimit);

    // Добавляем дополнительную информацию к книгам (жанры, если нужно)
    if (paginatedBooks.length > 0) {
      await storage.book.attachGenres(paginatedBooks);
    }

    const hasMore = parsedOffset + parsedLimit < total;

    return {
      success: true,
      message: 'Книги команды получены успешно',
      timestamp: new Date().toISOString(),
      items: {
        books: paginatedBooks.map((book: any) => storage.book.toPublic(book)),
        total,
        offset: parsedOffset,
        limit: parsedLimit,
        hasMore,
      },
      meta: {
        team: {
          id: team.id,
          name: team.name,
        },
        pagination: {
          offset: parsedOffset,
          limit: parsedLimit,
          total,
          hasMore,
          nextOffset: hasMore ? parsedOffset + parsedLimit : null,
        },
        filters: {
          types: parsedFilters.types || null,
          sort: sortField,
          order: sortOrder,
        },
      },
    };
  } catch (error: any) {
    console.error('Error in team books API:', error);
    
    // Если это ошибка createError, пробрасываем её
    if (error.statusCode) {
      throw error;
    }
    
    return {
      success: false,
      message:
        'Ошибка получения книг команды: ' + (error.message || 'Неизвестная ошибка'),
      items: { books: [], total: 0 },
    };
  }
});
