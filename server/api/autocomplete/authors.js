import errors from '~/errors.js'

export default defineApiHandler(async event => {
  const {text} = getQuery(event)
  if (!text) throw new errors.BadRequest('Нужен текст для поиска')

  const storage = event.context.storage
  const authors = await storage.author.find({name: {like: `%${text}%`}})

  return {
    authors: authors.map(author => storage.author.toPublic(author))
  }
})
