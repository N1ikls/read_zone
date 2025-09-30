import errors from '../../../utils/errors';

export default defineApiHandler(async (event: any) => {
  try {
    const storage = event.context.storage;
    const user = await event.context.context.user();

    // Проверяем авторизацию
    if (!user) {
      throw new errors.Unauthorized('Необходима авторизация');
    }

    const teamId = getRouterParam(event, 'id');
    if (!teamId) {
      throw new errors.BadRequest('ID команды обязателен');
    }

    // Проверяем существование команды
    const team = await storage.team.findOne({ id: teamId });
    if (!team) {
      throw new errors.NotFound('Команда не найдена');
    }

    // Проверяем права доступа (только создатель команды или админы)
    const isCreator = team.created_by === user.id;
    const isAdmin = user.role === 'admin' || user.role === 'moderator';
    
    // Проверяем, является ли пользователь админом команды
    const isTeamAdmin = await storage.user.knex('team_teammate')
      .where({ team_id: teamId, user_id: user.id, role: 'admin' })
      .first();

    if (!isCreator && !isAdmin && !isTeamAdmin) {
      throw new errors.Forbidden('Только создатель команды или администраторы могут просматривать заявки');
    }

    const { status = 'all', page = 1, limit = 20 } = getQuery(event);

    // Строим запрос для получения заявок
    let query = storage.user.knex('team_application')
      .select([
        'team_application.*',
        'user.name as user_name',
        'user.email as user_email',
        'user.avatar as user_avatar',
        'reviewer.name as reviewer_name'
      ])
      .leftJoin('user', 'team_application.user_id', 'user.id')
      .leftJoin('user as reviewer', 'team_application.reviewed_by', 'reviewer.id')
      .where('team_application.team_id', teamId);

    // Фильтр по статусу
    if (status !== 'all') {
      query = query.where('team_application.status', status);
    }

    // Подсчет общего количества - создаем отдельный запрос без JOIN'ов
    const totalQuery = storage.user.knex('team_application')
      .where('team_application.team_id', teamId);
    
    // Применяем тот же фильтр по статусу
    if (status !== 'all') {
      totalQuery.where('team_application.status', status);
    }
    
    const total = await totalQuery.count('* as count').first();

    // Пагинация
    const offset = (Number(page) - 1) * Number(limit);
    const applications = await query
      .orderBy('team_application.created_at', 'desc')
      .limit(Number(limit))
      .offset(offset);

    // Статистика по заявкам
    const stats = await storage.user.knex('team_application')
      .select('status')
      .count('* as count')
      .where('team_id', teamId)
      .groupBy('status');

    const statusStats = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach((stat: any) => {
      if (stat.status && statusStats.hasOwnProperty(stat.status)) {
        statusStats[stat.status as keyof typeof statusStats] = Number(stat.count);
      }
    });

    return {
      success: true,
      data: {
        applications,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total.count),
          pages: Math.ceil(Number(total.count) / Number(limit))
        },
        stats: statusStats
      }
    };

  } catch (error: any) {
    console.error('Error getting team applications:', error);

    if (error instanceof errors.HttpError) {
      throw error;
    }

    throw new errors.InternalServerError(
      'Ошибка получения заявок: ' + (error.message || 'Неизвестная ошибка')
    );
  }
});
