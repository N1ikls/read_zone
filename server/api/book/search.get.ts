export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  const { name, author_id } = getQuery(event);

  if (!name || !author_id) return [];

  const books = await storage.book.catalogSearch({ name, author_id });

  await storage.book.attachGenres(books);

  return books.map((book) => storage.book.toPublic(book));
});
