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

    // Получаем комментарий
    const comment = await storage.teamComment.findOne({ 
      id: commentId,
      team_id: teamId 
    });

    if (!comment) {
      throw new errors.NotFound('Комментарий не найден');
    }

    // Проверяем, что пользователь не лайкает свой собственный комментарий
    if (comment.created_by === user.id) {
      throw new errors.BadRequest('Нельзя лайкать собственные комментарии');
    }

    const body = await readBody(event);

    // Определяем тип реакции (лайк или дизлайк)
    const positive = body.positive !== false; // По умолчанию лайк

    // Добавляем/убираем лайк
    const result = await storage.teamComment.like(comment, user, positive);

    // Получаем обновленный комментарий с актуальной информацией о лайках
    const updatedComment = await storage.teamComment.findOne({ id: commentId }, {
      with: ['is_liked'],
      actor: user,
      toPublic: true
    });

    return {
      success: true,
      message: result.action,
      data: {
        comment: updatedComment,
        action: result.action,
        reaction_type: positive ? 'like' : 'dislike'
      }
    };

  } catch (error: any) {
    console.error('Error liking team comment:', error);

    if (error instanceof errors.HttpError) {
      throw error;
    }

    throw new errors.InternalServerError(
      'Ошибка обработки лайка: ' + (error.message || 'Неизвестная ошибка')
    );
  }
});
