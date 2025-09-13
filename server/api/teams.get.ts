export default defineApiHandler(async (event: any) => {
  try {
    const storage = event.context.storage;
    const user = await event.context.context.user();

    // Проверим что storage доступен
    if (!storage || !storage.team) {
      return {
        success: false,
        message: 'Storage не доступен',
        data: { teams: [], total: 0 },
      };
    }

    // Парсим параметры запроса
    const query = getQuery(event);
    const {
      guid,
      offset = 0,
      limit = 20,
      search,
      sort = 'created_at',
      order = 'desc',
    } = query;

    const parsedOffset = Math.max(0, parseInt(offset as string) || 0);
    const parsedLimit = Math.min(parseInt(limit as string) || 20, 100);

    // Строим фильтр для поиска
    const filter: any = {};

    if (search) {
      filter.name = { like: `%${search}%` };
    }

    if (guid) {
      filter.id = guid;
    }

    // Строим опции для сортировки и пагинации
    const options: any = {
      offset: parsedOffset,
      limit: parsedLimit,
      orderBy: [{ column: sort as string, order: order as string }],
      toPublic: true,
    };

    // Получаем команды
    const teams = await storage.team.find(filter, options);

    // Получаем общее количество команд для пагинации
    const totalTeams = await storage.team.find(filter, { count: true });
    const total = Array.isArray(totalTeams) ? totalTeams.length : totalTeams;

    // Для каждой команды получаем дополнительную информацию
    const enrichedTeams = await Promise.all(
      teams.map(async (team: any) => {
        try {
          // Получаем участников команды только если есть created_by
          let teammates = [];
          if (team.created_by) {
            teammates = await storage.team.getTeammates(team);
          }

          teammates.map((teammate: any) => {
            if (teammate.team_role === 'creator' || teammate.team_role === 'admin') {
              teammate.is_admin = true;
            } else {
              teammate.is_admin = false;
            }
          });

          // Получаем книги команды
          const books = await storage.team.getBooks(team);

          return {
            ...team,
            teammates_count: teammates?.length || 0,
            teammates: teammates || [],
            books_count: books?.length || 0,
            books: books?.slice(0, 3) || [], // Показываем только первые 3 книги
          };
        } catch (error) {
          console.error(
            `Ошибка получения данных для команды ${team.id}:`,
            error,
          );
          return {
            ...team,
            teammates_count: 0,
            teammates: [],
            books_count: 0,
            books: [],
          };
        }
      }),
    );

    const hasMore = parsedOffset + parsedLimit < total;

    return {
      success: true,
      message: 'Команды получены успешно',
      timestamp: new Date().toISOString(),
      items: {
        teams: enrichedTeams,
        total,
        offset: parsedOffset,
        limit: parsedLimit,
        hasMore,
      },
      meta: {
        pagination: {
          offset: parsedOffset,
          limit: parsedLimit,
          total,
          hasMore,
          nextOffset: hasMore ? parsedOffset + parsedLimit : null,
        },
        filters: {
          search: search || null,
          sort,
          order,
        },
      },
    };
  } catch (error: any) {
    console.error('Error in teams API:', error);
    return {
      success: false,
      message:
        'Ошибка получения команд: ' + (error.message || 'Неизвестная ошибка'),
      items: { teams: [], total: 0 },
    };
  }
});
