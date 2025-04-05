export default defineApiHandler(async event => {
  const {exclude_ids = '', text = ''} = getQuery(event)

  const storage = event.context.storage

  const filter = []

  const excludeIds = exclude_ids.split(',')
  if (excludeIds.length) filter.push({id: {'!=': excludeIds}})

  if (text.length) filter.push({name: {like: `%${text}%`}})

  const tags = await storage.tag.find(filter, {limit: 10})

  return {
    tags: tags.map(tag => storage.tag.toPublic(tag))
  }
})
