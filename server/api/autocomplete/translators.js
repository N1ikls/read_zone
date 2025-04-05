import errors from '~/errors.js'

export default defineApiHandler(async event => {
  const {text} = getQuery(event)
  if (!text) throw new errors.BadRequest('Нужен текст для поиска')

  const storage = event.context.storage
  const translators = await storage.user.find({name: {like: `%${text}%`}})

  return {
    translators: translators.map(translator => storage.user.toPublic(translator))
  }
})
