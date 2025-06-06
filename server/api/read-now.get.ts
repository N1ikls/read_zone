export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  const books = await storage.book.find({}, { limit: 5, order: { id: 'asc' } });

  await storage.book.attachGenres(books);

  return books.map((book) => storage.book.toPublic(book));
});
