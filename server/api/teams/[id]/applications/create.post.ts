import errors from '../../../../utils/errors';

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

    const body = await readBody(event);

    // Проверяем, не является ли пользователь уже участником команды
    const existingMember = await storage.user.knex('team_teammate')
      .where({ team_id: teamId, user_id: user.id })
      .first();

    if (existingMember) {
      throw new errors.BadRequest('Вы уже являетесь участником этой команды');
    }

    // Проверяем, не подавал ли пользователь уже заявку
    const existingApplication = await storage.user.knex('team_application')
      .where({ team_id: teamId, user_id: user.id })
      .whereIn('status', ['pending'])
      .first();

    if (existingApplication) {
      throw new errors.BadRequest('Вы уже подали заявку в эту команду');
    }

    // Создаем заявку
    const applicationData = {
      team_id: teamId,
      user_id: user.id,
      message: body.message?.trim() || null,
      status: 'pending'
    };

    const [result] = await storage.user.knex('team_application')
      .insert(applicationData)
      .returning('id');

    const applicationId = result.id;

    // Получаем созданную заявку с информацией о пользователе
    const application = await storage.user.knex('team_application')
      .select([
        'team_application.*',
        'user.name as user_name',
        'user.email as user_email',
        'user.avatar as user_avatar'
      ])
      .leftJoin('user', 'team_application.user_id', 'user.id')
      .where('team_application.id', applicationId)
      .first();

    return {
      success: true,
      message: 'Заявка в команду подана успешно',
      data: application
    };

  } catch (error: any) {
    console.error('Error creating team application:', error);

    if (error instanceof errors.HttpError) {
      throw error;
    }

    throw new errors.InternalServerError(
      'Ошибка создания заявки: ' + (error.message || 'Неизвестная ошибка')
    );
  }
});
