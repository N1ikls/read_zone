export default defineEventHandler(async (event) => {
  const storage = event.context.storage;
  const user = event.context.user;

  const { book_id, number } = getQuery(event);

  const [book, chapter] = await Promise.all([
    storage.book.findOne({ id: book_id }),
    storage.chapter.findOne({
      book_id: book_id,
      number: number,
    }),
  ]);

  if (!book) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Книга не найдена',
    });
  }

  if (!chapter) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Глава не найдена',
    });
  }

  const isReadable = await storage.chapter.isReadable(chapter, user);

  await Promise.all([
    storage.chapter.view(chapter, user),
    storage.readingHistory.save(
      {
        book_id: book.id,
        chapter_number: chapter.number,
      },
      user,
    ),
  ]);

  const [prevChapter, nextChapter, comments] = await Promise.all([
    storage.chapter.findOne({
      book_id: chapter.book_id,
      number: chapter.number - 1,
    }),
    storage.chapter.findOne({
      book_id: chapter.book_id,
      number: chapter.number + 1,
    }),
    storage.chapterComment.find(
      {
        chapter_id: chapter.id,
      },
      {
        order: { id: 'desc' },
        with: ['is_liked'],
        actor: user,
      },
    ),
  ]);

  return {
    book: storage.book.toPublic(book),
    chapter: storage.chapter.toReadable(chapter),
    navigation: {
      prev: prevChapter ? storage.chapter.toPublic(prevChapter) : null,
      next: nextChapter ? storage.chapter.toPublic(nextChapter) : null,
    },
    comments: comments.map((comment) =>
      storage.chapterComment.toPublic(comment),
    ),
    meta: {
      readable: isReadable,
    },
  };
});
