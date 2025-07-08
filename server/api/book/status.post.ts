import errors from '../../errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  if (!user) throw new errors.Unauthorized();

  const { guid, status } = getQuery(event);

  await storage.book.postStatus(guid, user, status);
});
