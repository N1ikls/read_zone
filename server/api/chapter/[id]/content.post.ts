import errors from '../../../utils/errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  if (!user) throw new errors.Unauthorized();

  const chapterId = getRouterParam(event, 'id');
  const body = await readBody(event);

  if (!chapterId) {
    throw new errors.BadRequest('Идентификатор главы не указан');
  }

  const chapter = await storage.chapter.findOne({ id: chapterId });

  if (!chapter) {
    throw new errors.NotFound('Глава не найдена');
  }

  // Проверяем права на редактирование
  const book = await storage.book.findOne({ id: chapter.book_id });
  if (!book) {
    throw new errors.NotFound('Книга не найдена');
  }

  if (!(await storage.book.isWriteable(book, user))) {
    throw new errors.Forbidden('Нет прав для редактирования этой главы');
  }

  // Обновляем главу
  const updateData = {
    updated_at: storage.chapter.knex.fn.now(),
    updated_by: user.id,
  };

  if (body.content !== undefined) {
    updateData.content = body.content;
  }

  if (body.name !== undefined) {
    updateData.name = body.name;
  }

  if (body.status !== undefined) {
    updateData.status = body.status;
  }

  if (body.is_public !== undefined) {
    updateData.is_public = body.is_public ? 1 : 0;
  }

  if (body.price !== undefined) {
    updateData.price = body.price;
  }

  if (body.volume !== undefined) {
    updateData.volume = body.volume;
  }

  await storage.chapter.knex(storage.chapter.table)
    .where('id', chapterId)
    .update(updateData);

  const updatedChapter = await storage.chapter.findOne({ id: chapterId });

  return {
    success: true,
    message: 'Глава успешно обновлена',
    chapter: storage.chapter.afterFetch(updatedChapter),
  };
});
