import { requireAdmin } from '../../utils/admin';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  // Проверяем права администратора
  await requireAdmin(event);

  const { page = 1, limit = 20, search, role, status } = getQuery(event);

  try {
    let query = storage.user
      .knex('user')
      .select([
        'user.id',
        'user.name',
        'user.email',
        'user.role',
        'user.created_at',
        'user.books_count',
        'user.chapters_in_month',
        'user.likers_count',
        'user.subscribers_count',
      ]);

    // Фильтр по поиску (имя или email)
    if (search) {
      query = query.where(function () {
        this.where('user.name', 'ilike', `%${search}%`).orWhere(
          'user.email',
          'ilike',
          `%${search}%`,
        );
      });
    }

    // Фильтр по роли
    if (role && role !== 'all') {
      if (role === 'user') {
        query = query.where(function () {
          this.whereNull('user.role').orWhere('user.role', '');
        });
      } else {
        query = query.where('user.role', role);
      }
    }

    // Подсчет общего количества
    const totalQuery = query.clone();
    const total = await totalQuery.count('* as count').first();

    // Пагинация
    const offset = (Number(page) - 1) * Number(limit);
    const users = await query
      .orderBy('user.created_at', 'desc')
      .limit(Number(limit))
      .offset(offset);

    // Получаем информацию о банах для каждого пользователя
    const userIds = users.map((user) => user.id);
    const bans = await storage.user
      .knex('user_bans')
      .whereIn('user_id', userIds)
      .where('expires_at', '>', new Date())
      .orWhereNull('expires_at');

    // Добавляем информацию о банах к пользователям
    const usersWithBans = users.map((user) => {
      const userBan = bans.find((ban) => ban.user_id === user.id);
      return {
        ...user,
        is_banned: !!userBan,
        ban_reason: userBan?.reason || null,
        ban_expires_at: userBan?.expires_at || null,
        ban_type: userBan?.type || null,
      };
    });

    return {
      users: usersWithBans,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(total?.count || '0'),
        totalPages: Math.ceil(parseInt(total?.count || '0') / Number(limit)),
      },
    };
  } catch (err) {
    console.error('Ошибка получения списка пользователей:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка получения списка пользователей',
    });
  }
});
