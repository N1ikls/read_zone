/**
 * Получает список глав книги с дополнительной информацией (лайки, доступность).
 * @param {Object} event - Объект события (H3/Nitro).
 * @returns {Promise<Array>} Массив глав с метаданными.
 */
export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const user = await event.context.context?.user();
  const { book_id, number = 'desc' } = getQuery(event);

  // Проверка обязательного параметра book_id
  if (!book_id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'book_id is required',
    });
  }

  // Загружаем главы с дополнительными данными (is_readable)
  const chapters = await storage.chapter.find(
    { book_id },
    {
      order: { number },
    },
    {
      with: ['is_readable'],
    },
  );

  if (!chapters.length) {
    return [];
  }

  const chaptersIds = chapters.map((c) => c.id);

  let likedMap: Record<string, boolean> = {};

  if (user) {
    likedMap = (await storage.chapter.getLiked(chaptersIds, user)) || {};
  }

  // Формируем ответ с публичными данными
  return chapters.map((chapter) => ({
    ...storage.chapter.toPublic(chapter),
    is_liked: !!likedMap[chapter.id],
  }));
});
