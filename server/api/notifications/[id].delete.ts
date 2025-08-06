import error from '../../utils/errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  if (!user) {
    return new error.Unauthorized('Необходима авторизация');
  }

  try {
    const notificationId = getRouterParam(event, 'id');
    
    if (!notificationId) {
      return new error.BadRequest('ID уведомления не указан');
    }

    // Проверяем что уведомление существует и принадлежит пользователю
    const notification = await storage.notification.findOne({
      id: notificationId,
      user_id: user.id
    });

    if (!notification) {
      return new error.NotFound('Уведомление не найдено');
    }

    // Удаляем уведомление
    const deletedCount = await storage.notification.deleteNotification(user.id, notificationId);

    if (deletedCount === 0) {
      return new error.NotFound('Уведомление не найдено или уже удалено');
    }

    // Возвращаем обновленное количество непрочитанных
    const unreadCount = await storage.notification.getUnreadCount(user.id);

    return {
      success: true,
      unread_count: unreadCount,
      message: 'Уведомление удалено'
    };

  } catch (err) {
    console.error('Error deleting notification:', err);
    return new error.InternalServerError('Ошибка при удалении уведомления');
  }
});
