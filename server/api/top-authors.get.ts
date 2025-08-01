export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  try {
    // Получаем топ авторов по популярности согласно ТЗ (лайки, подписчики, книги)
    const topAuthors = await storage.user
      .knex('user')
      .select([
        'user.id',
        'user.name',
        'user.avatar',
        'user.books_count',
        'user.chapters_in_month',
        'user.likers_count',
        'user.subscribers_count',
      ])
      .where('user.books_count', '>', 0) // только авторы с книгами
      .orderByRaw(
        '(user.likers_count + user.subscribers_count + user.books_count) DESC',
      ) // сортировка по популярности
      .limit(query?.limit || 10);

    // Получаем дополнительную статистику для каждого автора
    const authorsWithStats = await Promise.all(
      topAuthors.map(async (author) => {
        // Получаем общее количество лайков со всех книг автора
        const totalLikes = await storage.book
          .knex('book_liker')
          .join('book', 'book_liker.book_id', 'book.id')
          .where('book.user_id', author.id)
          .count('* as count')
          .first();

        // Получаем общее количество просмотров книг автора
        const totalViews = await storage.book
          .knex('book_viewer')
          .join('book', 'book_viewer.book_id', 'book.id')
          .where('book.user_id', author.id)
          .count('* as count')
          .first();

        // Получаем среднюю оценку книг автора
        const avgRating = await storage.book
          .knex('book_rater')
          .join('book', 'book_rater.book_id', 'book.id')
          .where('book.user_id', author.id)
          .avg('book_rater.rate as avg_rating')
          .first();

        // Получаем последние книги автора
        const recentBooks = await storage.book.find(
          { user_id: author.id },
          {
            limit: 3,
            order: { created_at: 'desc' },
          },
        );

        return {
          ...author,
          total_likes: parseInt(totalLikes?.count || '0'),
          total_views: parseInt(totalViews?.count || '0'),
          avg_rating: parseFloat(avgRating?.avg_rating || '0'),
          recent_books: recentBooks.map((book) => storage.book.toPublic(book)),
          // Рассчитываем рейтинг популярности
          popularity_score:
            author.likers_count +
            author.subscribers_count +
            author.books_count * 2,
        };
      }),
    );

    // Сортируем по рейтингу популярности
    authorsWithStats.sort((a, b) => b.popularity_score - a.popularity_score);

    return authorsWithStats.map((author) => ({
      id: author.id,
      name: author.name,
      avatar: author.avatar,
      books_count: author.books_count,
      chapters_in_month: author.chapters_in_month,
      likers_count: author.likers_count,
      subscribers_count: author.subscribers_count,
      total_likes: author.total_likes,
      total_views: author.total_views,
      avg_rating: author.avg_rating,
      recent_books: author.recent_books,
      popularity_score: author.popularity_score,
    }));
  } catch (err) {
    console.error('Ошибка получения топа авторов:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка получения топа авторов',
    });
  }
});
