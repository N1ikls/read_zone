import error from '../../errors';

export default defineApiHandler(async (event) => {
  const query = getQuery(event);

  if (!query.name || !query.email || !query.password) {
    throw createError({
      statusCode: 400,
      message: 'Не все поля заполнены',
    });
  }

  const user = await event.context.storage.user.register(query);

  return user;
});
