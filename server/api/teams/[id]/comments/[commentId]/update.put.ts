import errors from '../../../../../utils/errors';

export default defineApiHandler(async (event: any) => {
  try {
    const storage = event.context.storage;
    const user = await event.context.context.user();

    // Проверяем авторизацию
    if (!user) {
      throw new errors.Unauthorized('Необходима авторизация');
    }

    // Проверим что storage доступен
    if (!storage || !storage.teamComment) {
      throw new errors.InternalServerError('Storage не доступен');
    }

    // Получаем ID команды и комментария из параметров маршрута
    const teamId = getRouterParam(event, 'id');
    const commentId = getRouterParam(event, 'commentId');

    if (!teamId) {
      throw new errors.BadRequest('ID команды обязателен');
    }

    if (!commentId) {
      throw new errors.BadRequest('ID комментария обязателен');
    }

    // Проверяем, существует ли команда
    const team = await storage.team.findOne({ id: teamId });
    if (!team) {
      throw new errors.NotFound('Команда не найдена');
    }

    // Получаем комментарий для проверки авторства
    const comment = await storage.teamComment.findOne({ 
      id: commentId,
      team_id: teamId 
    });

    if (!comment) {
      throw new errors.NotFound('Комментарий не найден');
    }

    // Проверяем, что пользователь является автором комментария
    if (comment.created_by !== user.id) {
      throw new errors.Forbidden('Вы можете редактировать только свои комментарии');
    }

    const body = await readBody(event);

    // Валидация обязательных полей
    if (!body.content) {
      throw new errors.BadRequest('Содержимое комментария обязательно');
    }

    if (typeof body.content !== 'string' || body.content.trim().length === 0) {
      throw new errors.BadRequest('Комментарий не может быть пустым');
    }

    // Подготавливаем данные для обновления комментария
    const updateData: any = {
      id: commentId,
      content: body.content.trim(),
    };

    // Обновляем комментарий
    const updatedComment = await storage.teamComment.save(updateData, user);

    // Получаем обновленный комментарий с дополнительной информацией
    const enrichedComment = await storage.teamComment.findOne({ id: updatedComment.id }, {
      with: ['is_liked'],
      actor: user,
      toPublic: true
    });

    return {
      success: true,
      message: 'Комментарий обновлен успешно',
      data: enrichedComment,
    };

  } catch (error: any) {
    console.error('Error updating team comment:', error);

    if (error instanceof errors.HttpError) {
      throw error;
    }

    throw new errors.InternalServerError(
      'Ошибка обновления комментария: ' + (error.message || 'Неизвестная ошибка')
    );
  }
});
