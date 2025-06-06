export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  const books = await storage.book.find(
    {},
    { limit: 13, order: { id: 'desc' } },
  );

  return books;
});
