export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  const books = await storage.genre.find({}, { limit: 9 });

  return books.map((book) => storage.book.toPublic(book));
});
