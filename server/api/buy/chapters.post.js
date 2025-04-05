import errors from '~/errors.js'

export default defineApiHandler(async event => {
  const storage = event.context.storage
  const body = JSON.parse(await readBody(event))
  if (!body) throw new errors.BadRequest()

  const user = await event.context.context.user()
  if (!user) throw new errors.Unauthorized()

  const book = await storage.book.findOne({id: body?.book_id || 0})
  if (!book) throw new errors.NotFound('Книга не найдена')

  const chapters = await storage.chapter.find(
    {
      book_id: book.id,
      number: body?.chapters || [],
    },
    {
      actor: user,
      with: ['is_readable'],
    }
  )

  const pay = await storage.pay.save(
    {
      type: 'chapters',
      details: {
        book_id: book.id,
        chapters: chapters.map(chapter => chapter.number),
      }
    },
    user
  )

  return {pay: storage.pay.toPublic(pay)}
})
