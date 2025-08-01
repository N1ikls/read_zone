import { requireAdmin } from '../../../../utils/admin';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const userId = getRouterParam(event, 'id');

  // Проверяем права администратора
  const admin = await requireAdmin(event);

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID пользователя обязателен',
    });
  }

  try {
    // Проверяем существование пользователя
    const user = await storage.user.findOne({ id: userId });
    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Пользователь не найден',
      });
    }

    // Ищем активный бан
    const activeBan = await storage.user
      .knex('user_bans')
      .where('user_id', userId)
      .where('is_active', true)
      .where(function () {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .first();

    if (!activeBan) {
      throw createError({
        statusCode: 400,
        statusMessage: 'У пользователя нет активного бана',
      });
    }

    // Деактивируем бан
    await storage.user.knex('user_bans').where('id', activeBan.id).update({
      is_active: false,
      expires_at: new Date(), // устанавливаем дату окончания на текущий момент
    });

    // Логируем действие администратора
    await storage.user.knex('admin_logs').insert({
      admin_id: admin.id,
      action: 'unban',
      target_user_id: userId,
      details: `Разбанен пользователь ${user.name} (${user.email})`,
      data: JSON.stringify({
        original_ban_type: activeBan.type,
        original_ban_reason: activeBan.reason,
      }),
    });

    // Создаем уведомление для пользователя
    await storage.user.knex('notifications').insert({
      user_id: userId,
      type: 'system',
      title: 'Блокировка снята',
      content: 'Блокировка с вашего аккаунта была снята администратором.',
      data: JSON.stringify({
        unban_admin: admin.name,
        original_ban_reason: activeBan.reason,
      }),
    });

    return {
      success: true,
      message: 'Пользователь успешно разбанен',
      unban: {
        user_id: userId,
        unbanned_by: admin.name,
        original_ban_type: activeBan.type,
        original_ban_reason: activeBan.reason,
      },
    };
  } catch (err) {
    console.error('Ошибка при разбане пользователя:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при разбане пользователя',
    });
  }
});
