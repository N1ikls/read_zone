import errors from '~/errors.js'
import path from 'path'

export default defineApiHandler(async event => {
  const type = getRouterParam(event, 'type')
  const options = getEntityTypeOptions(event, type)

  const currentUser = await event.context.context.user()
  if (!currentUser) throw new errors.Unauthorized()

  const body = JSON.parse(await readBody(event))
  if (!body?.[type]) throw new errors.BadRequest('Требуется информация о сущности')

  const media = event.context.media
  let data = {}

  const newMedia = {}
  for (const src in options.media) {
    newMedia[src] = body[type]?.[src]
    delete body[type][src]
  }

  if (body[type]?.id) {
    const entity = await options.storage.findOne({id: body[type].id})

    if (!entity) throw new errors.NotFound('Не найдено')
    if (!await options.storage.isWriteable(entity, currentUser)) throw new errors.Forbidden('Недоступно')

    for (const src in options.media) {
      if (newMedia[src]) media.removeFile(`${type}/${options.media[src]}`, entity[options.media[src]])
    }

    data = {...body[type], id: entity.id}
  } else {
    data = body[type]
  }

  for (const src in options.media) {
    delete data[options.media[src]]
    if (newMedia[src]) data[options.media[src]] = getRandomFileName({ext: path.extname(newMedia[src].name)})
  }

  const entity = await options.storage.save(data, currentUser)
  const socials = 'socials' in body
    ? await options.storage.setSocials(entity, body.socials)
    : await options.storage.getSocials(entity)

  for (const src in options.media) {
    if (newMedia[src]) media.saveFromDataUrl(`${type}/${options.media[src]}`, entity[options.media[src]], newMedia[src])
  }

  return {[type]: entity, socials}
})
