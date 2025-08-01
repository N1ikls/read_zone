export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  try {
    // Получаем книги на которые чаще заходили в течении 3х дней согласно ТЗ
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const popularBooks = await storage.book.knex('book_viewer')
      .select('book_id')
      .count('* as view_count')
      .where('created_at', '>=', threeDaysAgo)
      .groupBy('book_id')
      .orderBy('view_count', 'desc')
      .limit(query?.limit || 20);

    if (popularBooks.length === 0) {
      // Если нет данных о просмотрах, возвращаем последние книги
      const books = await storage.book.find(
        {},
        {
          limit: query?.limit || 20,
          order: { id: 'desc' },
        },
      );
      
      await storage.book.attachGenres(books);
      return books.map((book) => storage.book.toPublic(book));
    }

    // Получаем полную информацию о книгах
    const bookIds = popularBooks.map(item => item.book_id);
    const books = await storage.book.find(
      { id: bookIds },
      {
        order: { id: 'desc' }
      }
    );

    // Сортируем книги по количеству просмотров
    const booksWithViews = books.map(book => {
      const viewData = popularBooks.find(item => item.book_id === book.id);
      return {
        ...book,
        view_count: parseInt(viewData?.view_count || '0')
      };
    }).sort((a, b) => b.view_count - a.view_count);

    await storage.book.attachGenres(booksWithViews);

    return booksWithViews.map((book) => storage.book.toPublic(book));
    
  } catch (err) {
    console.error('Ошибка получения популярных книг:', err);
    
    // В случае ошибки возвращаем последние книги
    const books = await storage.book.find(
      {},
      {
        limit: query?.limit || 20,
        order: { id: 'desc' },
      },
    );
    
    await storage.book.attachGenres(books);
    return books.map((book) => storage.book.toPublic(book));
  }
});
