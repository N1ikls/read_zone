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
      throw new errors.Forbidden('Только создатель команды или администраторы могут изменять роли');
    }

    const body = await readBody(event);
    const { role } = body;

    if (!role || !['', 'admin'].includes(role)) {
      throw new errors.BadRequest('Некорректная роль. Доступные: "" (участник), "admin"');
    }

    // Проверяем, что пользователь является участником команды
    const member = await storage.user.knex('team_teammate')
      .where({ team_id: teamId, user_id: userId })
      .first();

    if (!member) {
      throw new errors.NotFound('Пользователь не является участником команды');
    }

    // Нельзя изменить роль создателя команды
    if (team.created_by === userId) {
      throw new errors.BadRequest('Нельзя изменить роль создателя команды');
    }

    // Нельзя изменить свою собственную роль
    if (user.id === userId) {
      throw new errors.BadRequest('Нельзя изменить свою собственную роль');
    }

    // Обновляем роль участника
    await storage.user.knex('team_teammate')
      .where({ team_id: teamId, user_id: userId })
      .update({ role });

    // Получаем обновленную информацию об участнике
    const updatedMember = await storage.user.knex('team_teammate')
      .select([
        'team_teammate.*',
        'user.name as user_name',
        'user.email as user_email',
        'user.avatar as user_avatar'
      ])
      .leftJoin('user', 'team_teammate.user_id', 'user.id')
      .where({ team_id: teamId, user_id: userId })
      .first();

    // Отправляем уведомление пользователю об изменении роли
    await storage.user.knex('notifications').insert({
      user_id: userId,
      type: 'system_announcement',
      title: role === 'admin' ? 'Вы стали администратором команды' : 'Вы больше не администратор команды',
      message: role === 'admin' 
        ? `Вам была назначена роль администратора в команде "${team.name}"`
        : `С вас была снята роль администратора в команде "${team.name}"`,
      metadata: JSON.stringify({
        team_id: teamId,
        team_name: team.name,
        new_role: role,
        changed_by: user.name
      })
    });

    return {
      success: true,
      message: `Роль участника изменена на ${role === 'admin' ? 'администратор' : 'участник'}`,
      data: updatedMember
    };

  } catch (error: any) {
    console.error('Error updating member role:', error);

    if (error instanceof errors.HttpError) {
      throw error;
    }

    throw new errors.InternalServerError(
      'Ошибка изменения роли: ' + (error.message || 'Неизвестная ошибка')
    );
  }
});
