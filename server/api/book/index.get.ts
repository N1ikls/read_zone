import { isArray } from 'es-toolkit/compat';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  const { id } = getQuery(event);

  const book = await storage.book.catalogSearch({ id });

  if (!book) return null;

  if (isArray(book)) return book?.at(0);

  return book;
});
