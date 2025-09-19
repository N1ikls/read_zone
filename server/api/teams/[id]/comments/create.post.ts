import errors from '../../../../utils/errors';

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

    // Получаем ID команды из параметров маршрута
    const teamId = getRouterParam(event, 'id');
    if (!teamId) {
      throw new errors.BadRequest('ID команды обязателен');
    }

    // Проверяем, существует ли команда
    const team = await storage.team.findOne({ id: teamId });
    if (!team) {
      throw new errors.NotFound('Команда не найдена');
    }

    const body = await readBody(event);

    // Валидация обязательных полей
    if (!body.content) {
      throw new errors.BadRequest('Содержимое комментария обязательно');
    }

    if (typeof body.content !== 'string' || body.content.trim().length === 0) {
      throw new errors.BadRequest('Комментарий не может быть пустым');
    }

    // Подготавливаем данные для создания комментария
    const commentData: any = {
      team_id: teamId,
      content: body.content.trim(),
    };

    // Если указан parent_id, проверяем существование родительского комментария
    if (body.parent_id) {
      const parentComment = await storage.teamComment.findOne({ 
        id: body.parent_id,
        team_id: teamId // Убеждаемся что родительский комментарий принадлежит той же команде
      });
      
      if (!parentComment) {
        throw new errors.BadRequest('Родительский комментарий не найден');
      }
      
      commentData.parent_id = body.parent_id;
    }

    // Создаем комментарий
    const comment = await storage.teamComment.save(commentData, user);

    // Получаем созданный комментарий с дополнительной информацией
    const enrichedComment = await storage.teamComment.findOne({ id: comment.id }, {
      with: ['is_liked'],
      actor: user,
      toPublic: true
    });

    return {
      success: true,
      message: 'Комментарий создан успешно',
      data: enrichedComment,
    };

  } catch (error: any) {
    console.error('Error creating team comment:', error);

    if (error instanceof errors.HttpError) {
      throw error;
    }

    throw new errors.InternalServerError(
      'Ошибка создания комментария: ' + (error.message || 'Неизвестная ошибка')
    );
  }
});
