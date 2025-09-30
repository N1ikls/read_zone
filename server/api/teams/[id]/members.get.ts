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

    const { role = 'all', page = 1, limit = 50 } = getQuery(event);

    // Строим запрос для получения участников
    let query = storage.user.knex('team_teammate')
      .select([
        'team_teammate.*',
        'user.name as user_name',
        'user.email as user_email',
        'user.avatar as user_avatar',
        'user.role as user_system_role',
        'user.created_at as user_created_at'
      ])
      .leftJoin('user', 'team_teammate.user_id', 'user.id')
      .where('team_teammate.team_id', teamId);

    // Фильтр по роли
    if (role !== 'all') {
      query = query.where('team_teammate.role', role);
    }

    // Подсчет общего количества
    const totalQuery = storage.user.knex('team_teammate')
      .where('team_teammate.team_id', teamId);
    
    if (role !== 'all') {
      totalQuery.where('team_teammate.role', role);
    }
    
    const total = await totalQuery.count('* as count').first();

    // Пагинация
    const offset = (Number(page) - 1) * Number(limit);
    const members = await query
      .orderBy('team_teammate.role', 'desc') // Сначала админы, потом обычные участники
      .orderBy('user.name', 'asc')
      .limit(Number(limit))
      .offset(offset);

    // Статистика по ролям
    const roleStats = await storage.user.knex('team_teammate')
      .select('role')
      .count('* as count')
      .where('team_id', teamId)
      .groupBy('role');

    const stats = {
      total: Number(total.count),
      admins: 0,
      members: 0
    };

    roleStats.forEach(stat => {
      if (stat.role === 'admin') {
        stats.admins = Number(stat.count);
      } else {
        stats.members += Number(stat.count);
      }
    });

    // Добавляем информацию о создателе команды
    const creator = await storage.user.knex('user')
      .select(['id', 'name', 'email', 'avatar', 'role as user_system_role'])
      .where('id', team.created_by)
      .first();

    return {
      success: true,
      data: {
        members,
        creator: {
          ...creator,
          role: 'creator',
          is_creator: true
        },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: Number(total.count),
          pages: Math.ceil(Number(total.count) / Number(limit))
        },
        stats
      }
    };

  } catch (error: any) {
    console.error('Error getting team members:', error);

    if (error instanceof errors.HttpError) {
      throw error;
    }

    throw new errors.InternalServerError(
      'Ошибка получения участников: ' + (error.message || 'Неизвестная ошибка')
    );
  }
});
