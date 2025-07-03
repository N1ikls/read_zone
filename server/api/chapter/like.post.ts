export default defineEventHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context.user();

  const { book_id, number } = getQuery(event);

  const chapter = await storage.chapter.findOne({
    book_id,
    number,
  });

  if (!chapter) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Глава не найдена',
    });
  }

  const count = await storage.chapter.likeChapter(chapter, user, book_id);

  return count;
});
