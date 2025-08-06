import error from '../../utils/errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  if (!user) {
    return new error.Unauthorized('Необходима авторизация');
  }

  try {
    const settings = await storage.notification.getUserSettings(user.id);
    
    return {
      success: true,
      settings
    };

  } catch (err) {
    console.error('Error fetching notification settings:', err);
    return new error.InternalServerError('Ошибка при получении настроек уведомлений');
  }
});
