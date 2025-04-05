import errors from '~/errors.js'

export default defineApiHandler(async event => {
  const type = getRouterParam(event, 'type')
  const options = getEntityTypeOptions(event, type)

  const currentUser = await event.context.context.user()
  if (!currentUser) throw new errors.Unauthorized()

  const body = JSON.parse(await readBody(event))

  if (type === 'chapter') {
    const chapter = await options.storage.findOne({book_id: body[type].book_id, number: body[type].number})
    body[type].id = chapter.id
  }

  const comment = await options.commentStorage.save({[`${type}_id`]: body[type]?.id, content: body.content}, currentUser)

  return {comment}
})
