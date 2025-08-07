export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  // Проверяем авторизацию
  const user = await event.context.context.user();
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Необходима авторизация',
    });
  }

  try {
    // Подсчет непрочитанных
    const unreadCount = await storage.user
      .knex('notifications')
      .where('user_id', user.id)
      .where('is_read', false)
      .count('* as count')
      .first();

    return parseInt(unreadCount?.count || '0');
  } catch (err) {
    console.error('Ошибка получения уведомлений:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка получения уведомлений',
    });
  }
});
