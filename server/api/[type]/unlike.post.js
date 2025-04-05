import errors from '~/errors.js'

export default defineApiHandler(async event => {
  const type = getRouterParam(event, 'type')
  const options = getEntityTypeOptions(event, type)

  const body = JSON.parse(await readBody(event))
  if (!body?.[type]?.id) throw new errors.BadRequest('Требуется информация о сущности')

  const currentUser = await event.context.context.user()
  if (!currentUser) throw new errors.Unauthorized()

  await options.storage.unlike(body[type], currentUser)

  const response = {
    liked: false,
    likers_count: await options.storage.likers_count(body[type], true)
  }

  if (options.storage.isDislikeable) {
    response.disliked = false
    response.dislikers_count = await options.storage.likers_count(body[type], false)
  }

  return response
})
