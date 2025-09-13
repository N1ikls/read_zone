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

    // Получаем тело запроса с фильтрами
    const body = await readBody(event);
    const {
      page = 1,
      limit = 10,
      ...filters
    } = body;

    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedLimit = Math.min(parseInt(limit) || 10, 100);

    // Находим команду
    const team = await storage.team.findOne({ id: teamId });
    if (!team) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Команда не найдена',
      });
    }

    // Получаем всех участников команды для фильтрации книг
    const teammates = await storage.team.getTeammates(team);
    const teammateIds = teammates.map((teammate: any) => teammate.id);

    // Добавляем фильтр по переводчикам команды к существующим фильтрам
    const catalogFilters: any = { 
      ...filters,
      translator_id: teammateIds.join(',') // catalogSearch ожидает строку для translator_id
    };

    // Получаем все книги команды с применением фильтров через catalogSearch
    const allBooks = await storage.book.catalogSearch(catalogFilters);

    // Применяем пагинацию
    const start = (parsedPage - 1) * parsedLimit;
    const end = start + parsedLimit;
    const paginatedBooks = allBooks.slice(start, end);

    // Добавляем жанры к книгам
    if (paginatedBooks.length > 0) {
      await storage.book.attachGenres(paginatedBooks);
    }

    const total = allBooks.length;
    const hasMore = end < total;

    return {
      success: true,
      message: 'Книги команды получены успешно',
      timestamp: new Date().toISOString(),
      items: {
        books: paginatedBooks.map((book: any) => storage.book.toPublic(book)),
        total,
        page: parsedPage,
        limit: parsedLimit,
        hasMore,
      },
      meta: {
        team: {
          id: team.id,
          name: team.name,
        },
        pagination: {
          page: parsedPage,
          limit: parsedLimit,
          total,
          hasMore,
          nextPage: hasMore ? parsedPage + 1 : null,
          totalPages: Math.ceil(total / parsedLimit),
        },
        filters: {
          ...filters,
          applied_team_filter: teammateIds.length > 0,
        },
      },
    };
  } catch (error: any) {
    console.error('Error in team books POST API:', error);
    
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
