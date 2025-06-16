import errors from '../errors';

export default defineApiHandler(async (event) => {
  const user = await event.context.context.user();

  if (!user) throw new errors.Unauthorized();

  const { guid, type } = getQuery(event);

  if (guid) throw new errors.BadRequest('Нужен идентификатор книги');
  if (!type) throw new errors.BadRequest('Нужен тип закладки');

  const storage = event.context.storage;

  if (type) {
    const bookmark = await storage.bookmark.save({
      book_id: guid,
      user_id: user.id,
      type,
    });
    return { bookmark };
  } else {
    await storage.bookmark.delete({ book_id: guid, user_id: user.id });
    return {
      bookmark: { book_id: guid, user_id: user.id, type: null },
    };
  }
});
