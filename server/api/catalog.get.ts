export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  const books = await storage.book.catalogSearch(query);

  await storage.book.attachGenres(books);

  return books.map((book) => storage.book.toPublic(book));
});
