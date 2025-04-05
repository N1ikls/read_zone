import errors from '~/errors.js'

export default defineApiHandler(async event => {
  const type = getRouterParam(event, 'type')
  const options = getEntityTypeOptions(event, type)

  const body = JSON.parse(await readBody(event))
  if (!body?.[type]?.id) throw new errors.BadRequest('Требуется информация о сущности')

  const currentUser = await event.context.context.user()
  if (!currentUser) throw new errors.Unauthorized()

  await options.storage.subscribe(body[type], currentUser)

  return {
    subscribed: true,
    subscribers_count: await options.storage.subscribers_count(body[type])
  }
})
