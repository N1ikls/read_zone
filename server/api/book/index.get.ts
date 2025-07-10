import { isArray } from 'es-toolkit/compat';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  const user = await event.context.context.user();

  const { id } = getQuery(event);

  const book = await storage.book.catalogSearch({ id });

  if (!book) return null;

  const rate_counts = await storage.book.getRateCounts(id);

  const is_writeable = await storage.book.isWriteable(book, user);

  return isArray(book) ? { ...book?.at(0), rate_counts, is_writeable } : null;
});
