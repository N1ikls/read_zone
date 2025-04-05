export default defineApiHandler(async event => {
  const storage = event.context.storage
  const {text} = getQuery(event)

  const books = await storage.book.find(
    {':or': [
      {name: {like: `%${text}%`}},
      {alt_name: {like: `%${text}%`}}
    ]},
    {limit: 10}
  )

  return {
    books: books.map(book => storage.book.toPublic(book))
  }
})
