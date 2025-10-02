import errors from '../../../../../utils/errors';

export default defineApiHandler(async (event: any) => {
  try {
    const storage = event.context.storage;
    const user = await event.context.context.user();

    // Проверяем авторизацию
    if (!user) {
      throw new errors.Unauthorized('Необходима авторизация');
    }

    const teamId = getRouterParam(event, 'id');
    const userId = getRouterParam(event, 'userId');
    
    if (!teamId || !userId) {
      throw new errors.BadRequest('ID команды и пользователя обязательны');
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
      throw new errors.Forbidden('Только создатель команды или администраторы могут удалять участников');
    }

    // Проверяем, что пользователь является участником команды
    const member = await storage.user.knex('team_teammate')
      .where({ team_id: teamId, user_id: userId })
      .first();

    if (!member) {
      throw new errors.NotFound('Пользователь не является участником команды');
    }

    // Нельзя удалить создателя команды
    if (team.created_by === userId) {
      throw new errors.BadRequest('Нельзя удалить создателя команды');
    }

    // Нельзя удалить самого себя
    if (user.id === userId) {
      throw new errors.BadRequest('Нельзя удалить самого себя из команды');
    }

    // Получаем информацию о пользователе для уведомления
    const targetUser = await storage.user.findOne({ id: userId });

    // Удаляем участника из команды
    await storage.user.knex('team_teammate')
      .where({ team_id: teamId, user_id: userId })
      .del();

    // Обновляем счетчик участников команды
    await storage.team.knex('team')
      .where('id', teamId)
      .decrement('members_count', 1);

    // Отправляем уведомление пользователю об удалении
    await storage.user.knex('notifications').insert({
      user_id: userId,
      type: 'system_announcement',
      title: 'Вы были удалены из команды',
      message: `Вы были удалены из команды "${team.name}"`,
      metadata: JSON.stringify({
        team_id: teamId,
        team_name: team.name,
        removed_by: user.name
      })
    });

    return {
      success: true,
      message: 'Участник удален из команды',
      data: {
        removed_user_id: userId,
        removed_user_name: targetUser?.name || 'Неизвестный пользователь'
      }
    };

  } catch (error: any) {
    console.error('Error removing team member:', error);

    if (error instanceof errors.HttpError) {
      throw error;
    }

    throw new errors.InternalServerError(
      'Ошибка удаления участника: ' + (error.message || 'Неизвестная ошибка')
    );
  }
});
