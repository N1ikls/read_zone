import error from '../../utils/errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  if (!user) {
    return new error.Unauthorized('Необходима авторизация');
  }

  try {
    const body = await readBody(event);
    
    if (!body || typeof body !== 'object') {
      return new error.BadRequest('Некорректные данные настроек');
    }

    const updatedSettings = await storage.notification.updateUserSettings(user.id, body);
    
    return {
      success: true,
      settings: updatedSettings,
      message: 'Настройки уведомлений обновлены'
    };

  } catch (err) {
    console.error('Error updating notification settings:', err);
    
    if (err.message && err.message.includes('валидных настроек')) {
      return new error.BadRequest(err.message);
    }
    
    return new error.InternalServerError('Ошибка при обновлении настроек уведомлений');
  }
});
