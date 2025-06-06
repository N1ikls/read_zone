export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const { page = 1, limit = 10, ...query } = getQuery(event);

  const books = await storage.book.catalogSearch(query);

  await storage.book.attachGenres(books);

  const start = (Number(page) - 1) * Number(limit);
  const end = start + Number(limit);
  const paginatedBooks = books.slice(start, end);

  return {
    items: paginatedBooks.map((book) => storage.book.toPublic(book)),
    total: books.length,
    page: Number(page),
    limit: Number(limit),
  };
});
