import errors from '~/errors.js'

export default defineApiHandler(async event => {
  const type = getRouterParam(event, 'type')
  const options = getEntityTypeOptions(event, type)

  const body = JSON.parse(await readBody(event))
  if (!body[type]?.id) throw new errors.BadRequest('Требуется информация о сущности')
  if (!'value' in body) throw new errors.BadRequest('Требуется значение рейтинга')
  if (!(0 <= body.value && body.value <= 5)) throw new errors.BadRequest('Неправильное значение рейтинга')

  const currentUser = await event.context.context.user()
  if (!currentUser) throw new errors.Unauthorized()

  await options.storage.rate({id: body[type].id}, currentUser, body.value)
  const book = await options.storage.findOne({id: body[type].id})

  return {
    rate: book.rate,
    rateCounts: await options.storage.getRateCounts({id: body[type].id}),
    value: body.value || null,
  }
})
