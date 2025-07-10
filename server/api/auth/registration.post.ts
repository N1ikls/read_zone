import error from '../../utils/errors';

export default defineApiHandler(async (event) => {
  const body = await readBody(event);

  console.log(body);
  if (!(body.login && body.password && body.username))
    return new error.BadRequest('Неправильный логин или пароль');

  const user = await event.context.storage.user.registration(
    body.login,
    body.username,
    body.password,
  );

  if (!user) return new error.Unauthorized('Неправильный логин или пароль');

  event.context.session.user = { id: user.id };

  return event.context.storage.user.toPublic(
    await event.context.context.user(),
  );
});
