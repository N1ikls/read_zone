import { requireAdmin } from '../../../../utils/admin';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const userId = getRouterParam(event, 'id');

  // Проверяем права администратора
  const admin = await requireAdmin(event);

  const body = await readBody(event);
  const { role } = body;

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID пользователя обязателен',
    });
  }

  if (!role || !['', 'admin', 'moderator'].includes(role)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Некорректная роль. Доступные роли: admin, moderator, или пустая строка для обычного пользователя',
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

    // Нельзя изменять роль самому себе
    if (userId === admin.id) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Нельзя изменять собственную роль',
      });
    }

    const oldRole = user.role || 'user';

    // Обновляем роль пользователя
    await storage.user
      .knex('user')
      .where('id', userId)
      .update({
        role: role || null,
        updated_at: new Date(),
      });

    // Логируем действие администратора
    const action = role ? 'grant_role' : 'revoke_role';
    await storage.user.knex('admin_logs').insert({
      admin_id: admin.id,
      action,
      target_user_id: userId,
      details: `Изменена роль пользователя ${user.name} (${user.email}) с "${oldRole}" на "${role || 'user'}"`,
      data: JSON.stringify({
        old_role: oldRole,
        new_role: role || 'user',
      }),
    });

    // Создаем уведомление для пользователя
    const roleNames = {
      '': 'пользователь',
      'admin': 'администратор',
      'moderator': 'модератор',
    };

    await storage.user.knex('notifications').insert({
      user_id: userId,
      type: 'system',
      title: 'Изменение роли',
      content: `Ваша роль была изменена на "${roleNames[role] || 'пользователь'}"`,
      data: JSON.stringify({
        old_role: oldRole,
        new_role: role || 'user',
        changed_by: admin.name,
      }),
    });

    return {
      success: true,
      message: 'Роль пользователя успешно изменена',
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        old_role: oldRole,
        new_role: role || 'user',
        changed_by: admin.name,
      },
    };
  } catch (err) {
    console.error('Ошибка при изменении роли пользователя:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при изменении роли пользователя',
    });
  }
});
