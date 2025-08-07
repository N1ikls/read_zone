import errors from '../../../utils/errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  if (!user) throw new errors.Unauthorized();

  const chapterId = getRouterParam(event, 'id');

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

  return {
    id: chapter.id,
    book_id: chapter.book_id,
    number: chapter.number,
    name: chapter.name,
    content: chapter.content,
    status: chapter.status,
    is_public: chapter.is_public,
    price: chapter.price,
    volume: chapter.volume,
  };
});
