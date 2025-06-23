// server/api/authors/my-works.ts
export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  if (!user) {
    throw createError({ statusCode: 401, message: 'Необходима авторизация' });
  }

  const { status = 'all', name, page = 1, limit = 10 } = getQuery(event);

  const books = await storage.book.catalogSearch({
    author_id: user.id,
    name,
    status,
  });

  const bookmarks = await storage.bookmark.getByUserId(user.id);
  const booksWithBookmarks = books.map((book) => {
    const bookmark = bookmarks.find((b) => b.book_id === book.id);
    return {
      ...book,
      bookmark_type: bookmark?.type,
      is_bookmarked: !!bookmark,
    };
  });

  const start = (Number(page) - 1) * Number(limit);
  const end = start + Number(limit);
  const paginatedBooks = booksWithBookmarks.slice(start, end);

  await storage.book.attachGenres(paginatedBooks);
  // await storage.book.attachAuthors(paginatedBooks);

  return {
    items: paginatedBooks,
    total: booksWithBookmarks.length,
    page: Number(page),
    limit: Number(limit),
  };
});
