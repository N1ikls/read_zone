import errors from '../../utils/errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  const user = await event.context.context.user();
  if (!user) throw new errors.Unauthorized();

  const { guid, number } = getQuery(event);

  if (!number) throw new errors.BadRequest('Номер не указан');
  if (!guid) throw new errors.BadRequest('Идентификатор не указан');

  const entity = await storage.book.findOne({ id: guid });
  if (!entity) throw new errors.NotFound('Не найдено');

  if (!(await storage.book.isWriteable(entity, user)))
    throw new errors.Forbidden();

  await storage.chapter.delete({ book_id: guid, number: number });

  return { success: true };
});
