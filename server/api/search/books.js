export default defineApiHandler(async event => {
  const query = getQuery(event)
  const storage = event.context.storage

  const books = await storage.book.catalogSearch(query)

  return {
    books: books.map(book => storage.book.toPublic(book))
  }
})
