import error from '../../utils/errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  if (!user) {
    return new error.Unauthorized('Необходима авторизация');
  }

  try {
    const body = await readBody(event);
    const { notification_ids = null, mark_all = false } = body;

    if (mark_all) {
      // Помечаем все уведомления как прочитанные
      await storage.notification.markAsRead(user.id);
    } else if (notification_ids) {
      // Помечаем конкретные уведомления
      if (!Array.isArray(notification_ids)) {
        return new error.BadRequest('notification_ids должен быть массивом');
      }

      await storage.notification.markAsRead(user.id, notification_ids);
    } else {
      return new error.BadRequest(
        'Необходимо указать notification_ids или mark_all',
      );
    }

    // Возвращаем обновленное количество непрочитанных
    const unreadCount = await storage.notification.getUnreadCount(user.id);

    return {
      success: true,
      unread_count: unreadCount,
      message: mark_all
        ? 'Все уведомления помечены как прочитанные'
        : `${notification_ids.length} уведомлений помечено как прочитанные`,
    };
  } catch (err) {
    console.error('Error marking notifications as read:', err);
    return new error.InternalServerError('Ошибка при обновлении уведомлений');
  }
});
