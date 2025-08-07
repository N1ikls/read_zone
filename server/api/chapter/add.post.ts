import errors from '../../utils/errors';

export default defineApiHandler(async (event: any) => {
  const storage = event.context.storage;

  const user = await event.context.context.user();
  if (!user) throw new errors.Unauthorized();

  const data = await readBody(event);

  if (!data?.book_id)
    throw new errors.BadRequest('Идентификатор книги не указан');
  if (!data?.name) throw new errors.BadRequest('Название главы обязательно');

  const entity = await storage.book.findOne({ id: data.book_id });

  if (!entity) throw new errors.NotFound('Книга не найдена');

  if (!(await storage.book.isWriteable(entity, user)))
    throw new errors.Forbidden('Нет прав для добавления глав к этой книге');

  const item = await storage.chapter.addChapter(data, user);

  return item;
});
