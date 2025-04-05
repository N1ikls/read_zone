import errors from '~/errors.js'

export default defineApiHandler(async event => {
  const storage = event.context.storage

  const body = JSON.parse(await readBody(event))
  if (!body?.pay?.id) throw new errors.BadRequest('Нужен идентификатор платежа')

  const user = await event.context.context.user()
  if (!user) throw new errors.Unauthorized()

  let pay = await storage.pay.findOne({id: body.pay.id})
  if (!pay) throw new errors.NotFound('Платёж не найден')
  if (pay.created_by != user.id) throw new errors.Forbidden()

  pay = await storage.pay.success(pay, user)

  return {pay: storage.pay.toPublic(pay)}
})
