import errors from '~/errors.js'

export default defineApiHandler(async event => {
  const user = await event.context.context.user()
  if (!user) throw new errors.Unauthorized()

  const body = JSON.parse(await readBody(event))
  if (!body.book.id) throw new errors.BadRequest('Нужен идентификатор книги')
  if (!('type' in body)) throw new errors.BadRequest('Нужен тип закладки')

  const storage = event.context.storage

  if (body.type) {
    const bookmark = await storage.bookmark.save({book_id: body.book.id, user_id: user.id, type: body.type})
    return {bookmark}
  } else {
    await storage.bookmark.delete({book_id: body.book.id, user_id: user.id})
    return {
      bookmark: {book_id: body.book.id, user_id: user.id, type: null}
    }
  }
})
