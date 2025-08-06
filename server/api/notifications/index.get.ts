import error from '../../utils/errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  if (!user) {
    return new error.Unauthorized('Необходима авторизация');
  }

  try {
    const query = getQuery(event);
    const { 
      page = 1, 
      limit = 20, 
      unread_only = false,
      type = null 
    } = query;

    // Получаем уведомления пользователя
    const notifications = await storage.notification.getUserNotifications(user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      unread_only: unread_only === 'true',
      type
    });

    // Получаем количество непрочитанных
    const unreadCount = await storage.notification.getUnreadCount(user.id);

    // Получаем общее количество для пагинации
    let totalQuery = storage.notification.knex('notifications')
      .where('user_id', user.id);
    
    if (unread_only === 'true') {
      totalQuery = totalQuery.where('is_read', false);
    }
    
    if (type) {
      totalQuery = totalQuery.where('type', type);
    }
    
    const totalResult = await totalQuery.count('* as count').first();
    const total = parseInt(totalResult.count) || 0;

    return {
      notifications,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      },
      unread_count: unreadCount
    };

  } catch (err) {
    console.error('Error fetching notifications:', err);
    return new error.InternalServerError('Ошибка при получении уведомлений');
  }
});
