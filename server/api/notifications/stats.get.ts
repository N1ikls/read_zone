import error from '../../utils/errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  if (!user) {
    return new error.Unauthorized('Необходима авторизация');
  }

  try {
    const stats = await storage.notification.getNotificationStats(user.id);
    
    return {
      success: true,
      stats
    };

  } catch (err) {
    console.error('Error fetching notification stats:', err);
    return new error.InternalServerError('Ошибка при получении статистики уведомлений');
  }
});
