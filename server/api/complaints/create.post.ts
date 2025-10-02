import errors from '../../utils/errors';

export default defineApiHandler(async (event: any) => {
  try {
    const storage = event.context.storage;
    const user = await event.context.context.user();

    if (!user) {
      throw new errors.Unauthorized('Необходима авторизация');
    }

    const body = await readBody(event);

    if (!body.type) {
      throw new errors.BadRequest('Тип жалобы обязателен');
    }

    if (!body.reason) {
      throw new errors.BadRequest('Причина жалобы обязательна');
    }

    if (typeof body.reason !== 'string' || body.reason.trim().length === 0) {
      throw new errors.BadRequest('Причина жалобы не может быть пустой');
    }

    const validTypes = ['user', 'book', 'chapter', 'comment'];
    if (!validTypes.includes(body.type)) {
      throw new errors.BadRequest(`Неправильный тип жалобы. Доступные типы: ${validTypes.join(', ')}`);
    }

    const complaintData: any = {
      user_id: user.id,
      type: body.type,
      reason: body.reason.trim(),
      comment: body.comment ? body.comment.trim() : null,
    };

    switch (body.type) {
      case 'comment':
        if (!body.target_comment_id) {
          throw new errors.BadRequest('ID комментария обязателен для жалобы на комментарий');
        }

        const comment = await storage.teamComment.findOne({ id: body.target_comment_id });
        if (!comment) {
          throw new errors.NotFound('Комментарий не найден');
        }

        if (comment.created_by === user.id) {
          throw new errors.BadRequest('Нельзя пожаловаться на собственный комментарий');
        }

        complaintData.target_comment_id = body.target_comment_id;
        complaintData.target_user_id = comment.created_by; // Автор комментария
        break;

      case 'user':
        if (!body.target_user_id) {
          throw new errors.BadRequest('ID пользователя обязателен для жалобы на пользователя');
        }

        const targetUser = await storage.user.findOne({ id: body.target_user_id });
        if (!targetUser) {
          throw new errors.NotFound('Пользователь не найден');
        }

        if (body.target_user_id === user.id) {
          throw new errors.BadRequest('Нельзя пожаловаться на самого себя');
        }

        complaintData.target_user_id = body.target_user_id;
        break;

      case 'book':
        if (!body.target_book_id) {
          throw new errors.BadRequest('ID книги обязательно для жалобы на книгу');
        }

        const book = await storage.book.findOne({ id: body.target_book_id });
        if (!book) {
          throw new errors.NotFound('Книга не найдена');
        }

        complaintData.target_book_id = body.target_book_id;
        complaintData.target_user_id = book.author_id; // Автор книги
        break;

      case 'chapter':
        if (!body.target_chapter_id) {
          throw new errors.BadRequest('ID главы обязательно для жалобы на главу');
        }

        const chapter = await storage.chapter.findOne({ id: body.target_chapter_id });
        if (!chapter) {
          throw new errors.NotFound('Глава не найдена');
        }

        complaintData.target_chapter_id = body.target_chapter_id;
        complaintData.target_user_id = chapter.translator_id; // Переводчик главы
        break;
    }

    const existingComplaint = await storage.user.knex('complaints')
      .where({
        user_id: user.id,
        type: body.type,
        ...(body.target_comment_id && { target_comment_id: body.target_comment_id }),
        ...(body.target_user_id && { target_user_id: body.target_user_id }),
        ...(body.target_book_id && { target_book_id: body.target_book_id }),
        ...(body.target_chapter_id && { target_chapter_id: body.target_chapter_id }),
      })
      .whereIn('status', ['pending', 'in_progress'])
      .first();

    if (existingComplaint) {
      throw new errors.BadRequest('Вы уже подали жалобу на этот объект');
    }

    // Создаем жалобу
    const [complaintId] = await storage.user.knex('complaints')
      .insert(complaintData)
      .returning('id');

    return {
      success: true,
      message: 'Жалоба успешно подана',
      data: {
        id: complaintId,
        type: body.type,
        status: 'pending'
      }
    };

  } catch (error: any) {
    console.error('Error creating complaint:', error);

    if (error instanceof errors.HttpError) {
      throw error;
    }

    throw new errors.InternalServerError(
      'Ошибка создания жалобы: ' + (error.message || 'Неизвестная ошибка')
    );
  }
});
