export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);

  try {
    // Получаем книги в которых была опубликована хоть одна новая глава согласно ТЗ
    const recentlyUpdatedBooks = await storage.chapter
      .knex('chapter')
      .select([
        'book.id',
        'book.name as title',
        'book.description',
        'book.background as cover',
        'book.status',
        'book.created_by as user_id',
        'book.created_at as book_created_at',
        'chapter.created_at as last_chapter_date',
        'chapter.name as last_chapter_title',
        'chapter.number as last_chapter_number',
      ])
      .join('book', 'chapter.book_id', 'book.id')
      .whereRaw(
        'chapter.created_at = (SELECT MAX(c2.created_at) FROM chapter c2 WHERE c2.book_id = book.id)',
      )
      .orderBy('chapter.created_at', 'desc')
      .limit(query?.limit || 20);

    if (recentlyUpdatedBooks.length === 0) {
      return [];
    }

    // Получаем информацию об авторах
    const userIds = [
      ...new Set(recentlyUpdatedBooks.map((book) => book.user_id)),
    ];
    const authors = await storage.user
      .knex('user')
      .select(['id', 'name', 'avatar'])
      .whereIn('id', userIds);

    const authorsMap = authors.reduce((acc, author) => {
      acc[author.id] = author;
      return acc;
    }, {});

    // Получаем жанры для книг
    const bookIds = recentlyUpdatedBooks.map((book) => book.id);
    const bookGenres = await storage.book
      .knex('book_genre')
      .select(['book_id', 'genre.name as genre_name'])
      .join('genre', 'book_genre.genre_id', 'genre.id')
      .whereIn('book_id', bookIds);

    const genresMap = bookGenres.reduce((acc, item) => {
      if (!acc[item.book_id]) {
        acc[item.book_id] = [];
      }
      acc[item.book_id].push(item.genre_name);
      return acc;
    }, {});

    // Получаем статистику для каждой книги
    const booksWithStats = await Promise.all(
      recentlyUpdatedBooks.map(async (book) => {
        // Общее количество глав
        const chaptersCount = await storage.chapter
          .knex('chapter')
          .where('book_id', book.id)
          .count('* as count')
          .first();

        // Количество лайков
        const likesCount = await storage.book
          .knex('book_liker')
          .where('book_id', book.id)
          .count('* as count')
          .first();

        // Количество просмотров
        const viewsCount = await storage.book
          .knex('book_viewer')
          .where('book_id', book.id)
          .count('* as count')
          .first();

        // Средняя оценка
        const avgRating = await storage.book
          .knex('book_rater')
          .where('book_id', book.id)
          .avg('rate as avg_rating')
          .first();

        return {
          id: book.id,
          title: book.title,
          description: book.description,
          cover: book.cover,
          status: book.status,
          created_at: book.book_created_at,
          last_update: book.last_chapter_date,
          last_chapter: {
            title: book.last_chapter_title,
            number: book.last_chapter_number,
            created_at: book.last_chapter_date,
          },
          author: authorsMap[book.user_id] || null,
          genres: genresMap[book.id] || [],
          stats: {
            chapters_count: parseInt(chaptersCount?.count || '0'),
            likes_count: parseInt(likesCount?.count || '0'),
            views_count: parseInt(viewsCount?.count || '0'),
            avg_rating: parseFloat(avgRating?.avg_rating || '0'),
          },
        };
      }),
    );

    return booksWithStats;
  } catch (err) {
    console.error('Ошибка получения последних обновлений:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка получения последних обновлений',
    });
  }
});
