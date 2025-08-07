// server/api/authors/my-works.ts
export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Необходима авторизация' });
  }

  const { type = 'all', fandom, name, page = 1, limit = 10 } = getQuery(event);

  // Получаем все книги переводчика
  const books = await storage.book.catalogSearch({
    translator_id: user.id,
    name,
  });

  // Получаем закладки пользователя для дополнительной информации
  const bookmarks = await storage.bookmark.getByUserId(user.id);

  // Добавляем информацию о закладках к книгам
  const booksWithBookmarks = books.map((book) => {
    const bookmark = bookmarks.find((b) => b.book_id === book.id);
    return {
      ...book,
      bookmark_type: bookmark?.type,
      is_bookmarked: !!bookmark,
      is_writeable: book.translator_id === user.id, // Пользователь может редактировать свои переводы
    };
  });

  // Фильтруем по статусу работы (не закладки)
  let filteredBooks = booksWithBookmarks;
  if (type !== 'all') {
    filteredBooks = booksWithBookmarks.filter((book) => book.status === type);
  }

  // Фильтруем по фэндому если указан
  if (fandom && fandom !== 'all') {
    // Сначала получаем фэндомы для всех книг
    await storage.book.attachFandoms(filteredBooks);
    filteredBooks = filteredBooks.filter(
      (book) => book.fandoms && book.fandoms.some((f) => f.id === fandom),
    );
  }

  const start = (Number(page) - 1) * Number(limit);
  const end = start + Number(limit);
  const paginatedBooks = filteredBooks.slice(start, end);

  await storage.book.attachGenres(paginatedBooks);
  await storage.book.attachFandoms(paginatedBooks);
  // await storage.book.attachAuthors(paginatedBooks);

  return {
    items: paginatedBooks,
    total: filteredBooks.length,
    page: Number(page),
    limit: Number(limit),
  };
});
