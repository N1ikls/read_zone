import { isArray } from 'es-toolkit/compat';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  const { id } = getQuery(event);

  const book = await storage.book.catalogSearch({ id });

  if (!book) return null;

  const rateCounts = await storage.book.getRateCounts(id);

  return isArray(book) ? { ...book?.at(0), rate_counts: rateCounts } : null;
});
