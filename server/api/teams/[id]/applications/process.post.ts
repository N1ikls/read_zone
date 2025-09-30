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

    // Проверяем права доступа (только создатель команды или админы)
    const isCreator = team.created_by === user.id;
    const isAdmin = user.role === 'admin' || user.role === 'moderator';
    
    // Проверяем, является ли пользователь админом команды
    const isTeamAdmin = await storage.user.knex('team_teammate')
      .where({ team_id: teamId, user_id: user.id, role: 'admin' })
      .first();

    if (!isCreator && !isAdmin && !isTeamAdmin) {
      throw new errors.Forbidden('Только создатель команды или администраторы могут обрабатывать заявки');
    }

    const body = await readBody(event);
    const { action, application_ids, admin_comment } = body;

    if (!action || !['approve', 'reject'].includes(action)) {
      throw new errors.BadRequest('Некорректное действие. Доступные: approve, reject');
    }

    if (!application_ids || !Array.isArray(application_ids) || application_ids.length === 0) {
      throw new errors.BadRequest('Список ID заявок обязателен');
    }

    // Получаем заявки для обработки
    const applications = await storage.user.knex('team_application')
      .where('team_id', teamId)
      .whereIn('id', application_ids)
      .where('status', 'pending');

    if (applications.length === 0) {
      throw new errors.BadRequest('Не найдено заявок для обработки');
    }

    const results = [];

    for (const application of applications) {
      try {
        // Обновляем статус заявки
        await storage.user.knex('team_application')
          .where('id', application.id)
          .update({
            status: action === 'approve' ? 'approved' : 'rejected',
            reviewed_by: user.id,
            admin_comment: admin_comment || null,
            reviewed_at: new Date()
          });

        // Если заявка одобрена, добавляем пользователя в команду
        if (action === 'approve') {
          // Проверяем, не является ли пользователь уже участником
          const existingMember = await storage.user.knex('team_teammate')
            .where({ team_id: teamId, user_id: application.user_id })
            .first();

          if (!existingMember) {
            // Добавляем пользователя в команду
            await storage.user.knex('team_teammate').insert({
              team_id: teamId,
              user_id: application.user_id,
              role: '' // Обычный участник
            });

            // Обновляем счетчик участников команды
            await storage.team.knex('team')
              .where('id', teamId)
              .increment('members_count', 1);
          }
        }

        // Отправляем уведомление пользователю
        await storage.user.knex('notifications').insert({
          user_id: application.user_id,
          type: 'system_announcement',
          title: action === 'approve' ? 'Заявка в команду одобрена' : 'Заявка в команду отклонена',
          message: action === 'approve' 
            ? `Ваша заявка в команду "${team.name}" была одобрена. ${admin_comment || ''}`
            : `Ваша заявка в команду "${team.name}" была отклонена. ${admin_comment || ''}`,
          metadata: JSON.stringify({
            team_id: teamId,
            team_name: team.name,
            application_id: application.id,
            action: action
          })
        });

        results.push({
          application_id: application.id,
          user_id: application.user_id,
          status: 'success',
          message: action === 'approve' ? 'Заявка одобрена' : 'Заявка отклонена'
        });

      } catch (error) {
        console.error(`Error processing application ${application.id}:`, error);
        results.push({
          application_id: application.id,
          user_id: application.user_id,
          status: 'error',
          message: 'Ошибка обработки заявки'
        });
      }
    }

    return {
      success: true,
      message: `Обработано ${results.length} заявок`,
      data: {
        results,
        action,
        processed_count: results.filter(r => r.status === 'success').length,
        error_count: results.filter(r => r.status === 'error').length
      }
    };

  } catch (error: any) {
    console.error('Error processing team applications:', error);

    if (error instanceof errors.HttpError) {
      throw error;
    }

    throw new errors.InternalServerError(
      'Ошибка обработки заявок: ' + (error.message || 'Неизвестная ошибка')
    );
  }
});
