import error from '../../errors';

export default defineApiHandler(async (event: H3Event<EventHandlerRequest>) => {
  const body = await readBody(event);
  const login = body.login;
  const password = body.password;

  if (!(login && password))
    return new error.BadRequest('Неправильный логин или пароль');

  const user = await event.context.storage.user.login(login, password);

  if (!user) return new error.Unauthorized('Неправильный логин или пароль');

  event.context.session.user = { id: user.id };

  return event.context.storage.user.toPublic(
    await event.context.context.user(),
  );
});
