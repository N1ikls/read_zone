export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  const user = await event.context.context.user();

  if (!user) {
    throw createError({ statusCode: 400, message: 'User ID is required' });
  }

  const { type = 'all', name, page = 1, limit = 10 } = getQuery(event);

  const bookmarks = await storage.bookmark.getByUserId(user.id);

  const filteredBookIds =
    type === 'all'
      ? bookmarks.map((b) => b.book_id)
      : bookmarks.filter((b) => b.type === type).map((b) => b.book_id);

  const books = await storage.book.catalogSearch({ id: filteredBookIds, name });

  const booksWithBookmarks = books.map((book) => {
    const bookmark = bookmarks.find((b) => b.book_id === book.id);
    return {
      ...book,
      bookmark_type: bookmark?.type,
    };
  });

  const start = (Number(page) - 1) * Number(limit);
  const end = start + Number(limit);
  const paginatedBooks = booksWithBookmarks.slice(start, end);

  await storage.book.attachGenres(booksWithBookmarks);

  return {
    items: paginatedBooks,
    total: booksWithBookmarks.length,
    page: Number(page),
    limit: Number(limit),
  };
});
