export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  
  // Проверяем авторизацию
  const user = await event.context.context.user();
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Необходима авторизация'
    });
  }
  
  const { page = 1, limit = 20, type = 'all', unread_only = false } = getQuery(event);
  
  try {
    let query = storage.user.knex('notifications')
      .where('user_id', user.id);
    
    // Фильтр по типу уведомлений
    if (type !== 'all') {
      query = query.where('type', type);
    }
    
    // Только непрочитанные
    if (unread_only === 'true' || unread_only === true) {
      query = query.where('is_read', false);
    }
    
    // Подсчет общего количества
    const totalQuery = query.clone();
    const total = await totalQuery.count('* as count').first();
    
    // Подсчет непрочитанных
    const unreadCount = await storage.user.knex('notifications')
      .where('user_id', user.id)
      .where('is_read', false)
      .count('* as count')
      .first();
    
    // Пагинация
    const offset = (Number(page) - 1) * Number(limit);
    const notifications = await query
      .orderBy('created_at', 'desc')
      .limit(Number(limit))
      .offset(offset);
    
    return {
      notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(total?.count || '0'),
        totalPages: Math.ceil(parseInt(total?.count || '0') / Number(limit))
      },
      unread_count: parseInt(unreadCount?.count || '0')
    };
    
  } catch (err) {
    console.error('Ошибка получения уведомлений:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка получения уведомлений'
    });
  }
});
