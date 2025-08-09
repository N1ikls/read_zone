export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  try {
    // Безопасная обработка лимита
    const limitRaw = Number(query?.limit ?? 10);
    const limit = Number.isFinite(limitRaw)
      ? Math.min(Math.max(Math.trunc(limitRaw), 1), 50)
      : 10;

    // 1) Считаем количество книг по каждому переводчику/создателю
    const booksCounts = await storage.book
      .knex('book')
      .select(
        storage.book.knex.raw('COALESCE(translator_id, created_by) as user_id'),
      )
      .count('* as books_count')
      .groupByRaw('COALESCE(translator_id, created_by)');

    if (!booksCounts.length) return [];

    const ids = booksCounts.map((b) => b.user_id);
    const countsMap = new Map(
      booksCounts.map((b) => [b.user_id, Number(b.books_count || 0)]),
    );

    // 2) Загружаем пользователей и их базовые показатели
    const users = await storage.user
      .knex('user as u')
      .select([
        'u.id',
        'u.name',
        'u.avatar',
        'u.chapters_in_month',
        'u.likers_count',
        'u.subscribers_count',
      ])
      .whereIn('u.id', ids);

    // 3) Формируем базовый список с подсчитанными books_count и сортируем
    const base = users
      .map((u) => {
        const books_count = countsMap.get(u.id) || 0;
        return {
          id: u.id,
          name: u.name,
          avatar: u.avatar,
          chapters_in_month: Number(u.chapters_in_month || 0),
          likers_count: Number(u.likers_count || 0),
          subscribers_count: Number(u.subscribers_count || 0),
          books_count,
        };
      })
      .sort(
        (a, b) =>
          b.likers_count +
          b.subscribers_count +
          b.books_count -
          (a.likers_count + a.subscribers_count + a.books_count),
      )
      .slice(0, limit);

    // 4) Для каждого автора получаем дополнительные метрики (по translator_id)
    const withStats = await Promise.all(
      base.map(async (author) => {
        const [totalLikes, totalViews, avgRating] = await Promise.all([
          storage.book
            .knex('book_liker')
            .join('book', 'book_liker.book_id', 'book.id')
            .whereRaw('COALESCE(book.translator_id, book.created_by) = ?', [
              author.id,
            ])
            .count('* as count')
            .first(),
          storage.book
            .knex('book_viewer')
            .join('book', 'book_viewer.book_id', 'book.id')
            .whereRaw('COALESCE(book.translator_id, book.created_by) = ?', [
              author.id,
            ])
            .count('* as count')
            .first(),
          storage.book
            .knex('book_rater')
            .join('book', 'book_rater.book_id', 'book.id')
            .whereRaw('COALESCE(book.translator_id, book.created_by) = ?', [
              author.id,
            ])
            .avg('book_rater.rate as avg_rating')
            .first(),
        ]);

        const recentBooks = await storage.book.find(
          { ':or': [{ translator_id: author.id }, { created_by: author.id }] },
          { limit: 3, order: { created_at: 'desc' } },
        );

        return {
          ...author,
          total_likes: parseInt(totalLikes?.count || '0'),
          total_views: parseInt(totalViews?.count || '0'),
          avg_rating: parseFloat(avgRating?.avg_rating || '0'),
          recent_books: recentBooks.map((b) => storage.book.toPublic(b)),
          popularity_score:
            author.likers_count + author.subscribers_count + author.books_count,
        };
      }),
    );

    return withStats
      .sort((a, b) => b.popularity_score - a.popularity_score)
      .map((author) => ({
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
