import { requireAdmin } from '../../../../utils/admin';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const userId = getRouterParam(event, 'id');

  // Проверяем права администратора
  const admin = await requireAdmin(event);

  const body = await readBody(event);
  const { type = 'mute', reason, duration } = body;

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID пользователя обязателен',
    });
  }

  if (!reason) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Причина бана обязательна',
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

    // Нельзя банить администраторов
    if (user.role === 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Нельзя банить администраторов',
      });
    }

    // Проверяем, нет ли уже активного бана
    const existingBan = await storage.user
      .knex('user_bans')
      .where('user_id', userId)
      .where('is_active', true)
      .where(function () {
        this.whereNull('expires_at').orWhere('expires_at', '>', new Date());
      })
      .first();

    if (existingBan) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Пользователь уже забанен',
      });
    }

    // Вычисляем дату окончания бана
    let expiresAt = null;
    if (duration && duration > 0) {
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + duration);
    }

    // Создаем бан
    const [banId] = await storage.user
      .knex('user_bans')
      .insert({
        user_id: userId,
        banned_by: admin.id,
        type,
        reason,
        expires_at: expiresAt,
        is_active: true,
      })
      .returning('id');

    // Логируем действие администратора
    await storage.user.knex('admin_logs').insert({
      admin_id: admin.id,
      action: 'ban',
      target_user_id: userId,
      details: `Забанен пользователь ${user.name} (${user.email}) по причине: ${reason}`,
      data: JSON.stringify({
        ban_type: type,
        duration: duration,
        expires_at: expiresAt,
      }),
    });

    // Создаем уведомление для пользователя
    await storage.user.knex('notifications').insert({
      user_id: userId,
      type: 'system',
      title: 'Ваш аккаунт заблокирован',
      content: `Ваш аккаунт был заблокирован по причине: ${reason}${expiresAt ? ` до ${expiresAt.toLocaleDateString()}` : ' навсегда'}`,
      data: JSON.stringify({
        ban_id: banId.id,
        ban_type: type,
        expires_at: expiresAt,
      }),
    });

    return {
      success: true,
      message: 'Пользователь успешно забанен',
      ban: {
        id: banId.id,
        type,
        reason,
        expires_at: expiresAt,
        banned_by: admin.name,
      },
    };
  } catch (err) {
    console.error('Ошибка при бане пользователя:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при бане пользователя',
    });
  }
});
