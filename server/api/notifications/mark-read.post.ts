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
  
  const body = await readBody(event);
  const { notification_ids, mark_all = false } = body;
  
  try {
    if (mark_all) {
      // Отмечаем все уведомления как прочитанные
      await storage.user.knex('notifications')
        .where('user_id', user.id)
        .where('is_read', false)
        .update({ is_read: true });
        
      return {
        success: true,
        message: 'Все уведомления отмечены как прочитанные'
      };
    } else if (notification_ids && Array.isArray(notification_ids)) {
      // Отмечаем конкретные уведомления как прочитанные
      await storage.user.knex('notifications')
        .whereIn('id', notification_ids)
        .where('user_id', user.id) // проверяем, что уведомления принадлежат пользователю
        .update({ is_read: true });
        
      return {
        success: true,
        message: `Отмечено как прочитанные: ${notification_ids.length} уведомлений`
      };
    } else {
      throw createError({
        statusCode: 400,
        statusMessage: 'Необходимо указать notification_ids или mark_all: true'
      });
    }
    
  } catch (err) {
    console.error('Ошибка при отметке уведомлений:', err);
    
    if (err.statusCode) {
      throw err;
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при отметке уведомлений'
    });
  }
});
