import errors from '~/errors.js'

export default defineApiHandler(async event => {
  const body = JSON.parse(await readBody(event))
  if (!body.book_id || !body.number) throw new errors.BadRequest('Глава не указана')

  const user = await event.context.context.user()
  if (!user) throw new errors.Unauthorized()

  const storage = event.context.storage
  const chapter = await storage.chapter.findOne({book_id: body.book_id, number: body.number})
  if (!chapter) throw new errors.NotFound('Глава не найдена')

  const error = await storage.chapterError.save({
    chapter_id: chapter.id,
    user_id: user.id,
    source: body.source,
    correct: body.correct,
    paragraph: body.paragraph,
    line: 1,
  }, user)

  return {error}
})