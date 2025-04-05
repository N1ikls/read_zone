import error from '~/errors.js'

export default defineApiHandler(async event => {
  const body = JSON.parse(await readBody(event))
  const login = body.login
  const password = body.password

  if (!(login && password)) throw new error.BadRequest('Неправильный логин или пароль')

  const user = await event.context.storage.user.login(login, password)
  if (!user) throw new error.Unauthorized('Неправильный логин или пароль')

  event.context.session.user = {id: user.id}

  return {
    context: {
      user: event.context.storage.user.toPublic(await event.context.context.user())
    }
  }
})
