import errors from '../../utils/errors';

export default defineApiHandler(async (event) => {
  const user = await event.context.context?.user();

  if (!user) throw new errors.Unauthorized();

  const { guid } = getQuery(event);

  if (!guid) throw new errors.BadRequest('Нужен идентификатор книги');

  const storage = event.context.storage;

  return storage.bookmark.getType(user.id, guid);
});
