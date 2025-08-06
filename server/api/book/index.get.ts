import { isArray } from 'es-toolkit/compat';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  const user = await event.context.context.user();

  const { id } = getQuery(event);

  const books = await storage.book.catalogSearch({ id });

  if (!books || (isArray(books) && books.length === 0)) return null;

  // Получаем первую книгу из результата
  const book = isArray(books) ? books[0] : books;

  if (!book) return null;

  const rate_counts = await storage.book.getRateCounts(id);

  const is_writeable = await storage.book.isWriteable(book, user);

  return { ...book, rate_counts, is_writeable };
});
