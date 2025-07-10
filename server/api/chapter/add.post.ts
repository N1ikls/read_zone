import errors from '../../utils/errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  const user = await event.context.context.user();
  if (!user) throw new errors.Unauthorized();

  const data = await readBody(event);

  if (!data?.book_id) throw new errors.BadRequest('Идентификатор не указан');

  const entity = await storage.book.findOne({ id: data.book_id });

  if (!entity) throw new errors.NotFound('Не найдено');

  if (!(await storage.book.isWriteable(entity, user)))
    throw new errors.Forbidden();

  const item = await storage.chapter.addChapter(data, user);

  return item;
});
