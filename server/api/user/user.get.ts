import error from '../../utils/errors';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const { id } = getQuery(event);

  if (!id) return new error.BadRequest('Неправильный id');

  const currentUser = await event.context.context.user();

  const user = await storage.user.findOne({ id });
  if (!user) return [];

  const data = await Promise.all([
    storage.user.isWriteable(user, currentUser),
    storage.user.isLiked(user, currentUser),
    storage.user.isSubscribed(user, currentUser),
    storage.user.getSocials(user),
  ]);

  return data;
});
