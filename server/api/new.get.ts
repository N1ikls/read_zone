export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  // Получаем книги за последнюю неделю согласно ТЗ
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const books = await storage.book
    .knex('book')
    .where('created_at', '>=', oneWeekAgo)
    .orderBy('created_at', 'desc')
    .limit(query?.limit || 20);

  // Если книг за неделю мало, дополняем последними созданными
  if (books.length < (query?.limit || 20)) {
    const additionalBooks = await storage.book.find(
      {},
      {
        limit: (query?.limit || 20) - books.length,
        order: { id: 'desc' },
      },
    );

    // Объединяем, избегая дублирования
    const existingIds = books.map((book) => book.id);
    const filteredAdditional = additionalBooks.filter(
      (book) => !existingIds.includes(book.id),
    );
    books.push(...filteredAdditional);
  }

  await storage.book.attachGenres(books);

  return books.map((book) => storage.book.toPublic(book));
});
