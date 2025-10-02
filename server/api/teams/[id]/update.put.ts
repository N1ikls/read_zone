import errors from '../../../utils/errors';

export default defineApiHandler(async (event: any) => {
  try {
    const storage = event.context.storage;
    const user = await event.context.context.user();

    // Проверяем авторизацию
    if (!user) {
      throw new errors.Unauthorized('Необходима авторизация');
    }

    const teamId = getRouterParam(event, 'id');
    if (!teamId) {
      throw new errors.BadRequest('ID команды обязателен');
    }

    // Проверяем существование команды
    const team = await storage.team.findOne({ id: teamId });
    if (!team) {
      throw new errors.NotFound('Команда не найдена');
    }

    // Проверяем права доступа (только создатель команды или админы)
    const isCreator = team.created_by === user.id;
    const isAdmin = user.role === 'admin' || user.role === 'moderator';
    
    // Проверяем, является ли пользователь админом команды
    const isTeamAdmin = await storage.user.knex('team_teammate')
      .where({ team_id: teamId, user_id: user.id, role: 'admin' })
      .first();

    if (!isCreator && !isAdmin && !isTeamAdmin) {
      throw new errors.Forbidden('Только создатель команды или администраторы могут изменять команду');
    }

    const body = await readBody(event);
    const { name, description, avatar, background } = body;

    // Валидация данных
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        throw new errors.BadRequest('Название команды не может быть пустым');
      }
      if (name.trim().length > 255) {
        throw new errors.BadRequest('Название команды слишком длинное');
      }
    }

    if (description !== undefined && description !== null) {
      if (typeof description !== 'string') {
        throw new errors.BadRequest('Описание должно быть строкой');
      }
    }

    if (avatar !== undefined && avatar !== null) {
      if (typeof avatar !== 'string') {
        throw new errors.BadRequest('Аватар должен быть строкой');
      }
    }

    if (background !== undefined && background !== null) {
      if (typeof background !== 'string') {
        throw new errors.BadRequest('Фон должен быть строкой');
      }
    }

    // Подготавливаем данные для обновления
    const updateData: any = {
      updated_at: new Date(),
      updated_by: user.id
    };

    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (background !== undefined) updateData.background = background;

    // Проверяем уникальность аватара и фона (если они указаны)
    if (avatar && avatar !== team.avatar) {
      const existingAvatar = await storage.team.knex('team')
        .where('avatar', avatar)
        .where('id', '!=', teamId)
        .first();

      if (existingAvatar) {
        throw new errors.BadRequest('Аватар уже используется другой командой');
      }
    }

    if (background && background !== team.background) {
      const existingBackground = await storage.team.knex('team')
        .where('background', background)
        .where('id', '!=', teamId)
        .first();

      if (existingBackground) {
        throw new errors.BadRequest('Фон уже используется другой командой');
      }
    }

    // Обновляем команду
    await storage.team.knex('team')
      .where('id', teamId)
      .update(updateData);

    // Получаем обновленную информацию о команде
    const updatedTeam = await storage.team.findOne({ id: teamId });

    return {
      success: true,
      message: 'Информация о команде обновлена успешно',
      data: updatedTeam
    };

  } catch (error: any) {
    console.error('Error updating team:', error);

    if (error instanceof errors.HttpError) {
      throw error;
    }

    throw new errors.InternalServerError(
      'Ошибка обновления команды: ' + (error.message || 'Неизвестная ошибка')
    );
  }
});
