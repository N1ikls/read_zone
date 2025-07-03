import errors from '../../errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  const { book_id, value } = getQuery(event);

  if (!value) throw new errors.BadRequest('Требуется значение рейтинга');

  if (!book_id) throw new errors.BadRequest('Требуется информация о сущности');

  if (!(0 <= Number(value) && Number(value) <= 5))
    throw new errors.BadRequest('Неправильное значение рейтинга');

  const user = await event.context.context.user();

  if (!user) throw new errors.Unauthorized();

  await storage.book.rate({ id: book_id }, user, value);

  return await storage.book.getRateCounts(book_id);
});
