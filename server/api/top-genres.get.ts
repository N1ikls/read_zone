export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  try {
    // Получаем популярные жанры согласно ТЗ (от лайков, посещений, рейтинга)
    const popularGenres = await storage.genre
      .knex('genre')
      .select([
        'genre.id',
        'genre.name',
        storage.genre.knex.raw(
          'COUNT(DISTINCT book_genre.book_id) as books_count',
        ),
        storage.genre.knex.raw(
          'COUNT(DISTINCT book_liker.book_id) as total_likes',
        ),
        storage.genre.knex.raw(
          'COUNT(DISTINCT book_viewer.book_id) as total_views',
        ),
        storage.genre.knex.raw('AVG(book_rater.rate) as avg_rating'),
      ])
      .leftJoin('book_genre', 'genre.id', 'book_genre.genre_id')
      .leftJoin('book', 'book_genre.book_id', 'book.id')
      .leftJoin('book_liker', 'book.id', 'book_liker.book_id')
      .leftJoin('book_viewer', 'book.id', 'book_viewer.book_id')
      .leftJoin('book_rater', 'book.id', 'book_rater.book_id')
      .groupBy('genre.id', 'genre.name')
      .havingRaw('COUNT(DISTINCT book_genre.book_id) > 0') // только жанры с книгами
      .orderByRaw(
        '(COUNT(DISTINCT book_liker.book_id) + COUNT(DISTINCT book_viewer.book_id) + (AVG(book_rater.rate) * 10) + COUNT(DISTINCT book_genre.book_id)) DESC',
      )
      .limit(query?.limit || 20);

    // Получаем последние книги для каждого жанра
    const genresWithBooks = await Promise.all(
      popularGenres.map(async (genre) => {
        const recentBooks = await storage.book
          .knex('book')
          .select([
            'book.id',
            'book.name as title',
            'book.background as cover',
            'book.created_at',
          ])
          .join('book_genre', 'book.id', 'book_genre.book_id')
          .where('book_genre.genre_id', genre.id)
          .orderBy('book.created_at', 'desc')
          .limit(5);

        return {
          id: genre.id,
          name: genre.name,
          books_count: parseInt(genre.books_count || '0'),
          total_likes: parseInt(genre.total_likes || '0'),
          total_views: parseInt(genre.total_views || '0'),
          avg_rating: parseFloat(genre.avg_rating || '0'),
          recent_books: recentBooks,
          // Рассчитываем популярность
          popularity_score:
            parseInt(genre.total_likes || '0') +
            parseInt(genre.total_views || '0') +
            parseFloat(genre.avg_rating || '0') * 10 +
            parseInt(genre.books_count || '0'),
        };
      }),
    );

    // Сортируем по популярности
    genresWithBooks.sort((a, b) => b.popularity_score - a.popularity_score);

    return genresWithBooks;
  } catch (err) {
    console.error('Ошибка получения популярных жанров:', err);

    // В случае ошибки возвращаем простой список жанров
    const genres = await storage.genre.find({}, { limit: query?.limit || 20 });
    return genres.map((genre) => storage.genre.toPublic(genre));
  }
});
