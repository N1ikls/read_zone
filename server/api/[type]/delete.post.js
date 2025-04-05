import errors from '~/errors.js'

export default defineApiHandler(async event => {
  const type = getRouterParam(event, 'type')
  const options = getEntityTypeOptions(event, type)

  const currentUser = await event.context.context.user()
  if (!currentUser) throw new errors.Unauthorized()

  const body = JSON.parse(await readBody(event))
  if (!body[type]?.id) throw new errors.BadRequest('Идентификатор не указан')

  const entity = await options.storage.findOne({id: body[type].id})
  if (!entity) throw new errors.NotFound('Не найдено')

  if (!await options.storage.isWriteable(entity, currentUser)) throw new errors.Forbidden()

  await options.storage.delete(entity, currentUser)

  return {success: true}
})
