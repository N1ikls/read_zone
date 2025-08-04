// Простой in-memory кэш для популярных книг
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 минут в миллисекундах

function getCacheKey(limit) {
  return `currently-reading-${limit}`;
}

function getCachedResult(key) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
}

function setCachedResult(key, data) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });

  // Очищаем старые записи из кэша
  if (cache.size > 10) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
}

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const query = getQuery(event);
  const limit = query?.limit || 20;

  // Проверяем кэш
  const cacheKey = getCacheKey(limit);
  const cachedResult = getCachedResult(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  try {
    // Получаем книги на которые чаще заходили в течении 3х дней согласно ТЗ
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    // Улучшенный алгоритм с учетом дополнительных метрик
    const popularBooksQuery = `
      SELECT
        book.id,
        book.name,
        book.description,
        book.background,
        book.status,
        book.rate,
        book.likers_count,
        book.viewers_count,
        book.bookmarks_count,
        book.year,
        book.created_at,
        book.author_id,
        book.translator_id,
        author.name as author_name,

        -- Подсчет просмотров за последние 3 дня
        COALESCE(recent_views.view_count, 0) as recent_view_count,

        -- Подсчет уникальных просмотров за последние 3 дня
        COALESCE(unique_views.unique_view_count, 0) as unique_view_count,

        -- Расчет популярности с весовыми коэффициентами
        (
          COALESCE(recent_views.view_count, 0) * 1.0 +           -- Общие просмотры
          COALESCE(unique_views.unique_view_count, 0) * 2.0 +    -- Уникальные просмотры (больший вес)
          COALESCE(book.likers_count, 0) * 3.0 +                -- Лайки (еще больший вес)
          COALESCE(book.rate, 0) * 5.0 +                        -- Рейтинг (максимальный вес)
          COALESCE(book.bookmarks_count, 0) * 2.5                -- Закладки
        ) as popularity_score

      FROM book
      LEFT JOIN author ON book.author_id = author.id

      -- Подсчет всех просмотров за 3 дня
      LEFT JOIN (
        SELECT
          book_id,
          COUNT(*) as view_count
        FROM book_viewer
        WHERE created_at >= ?
        GROUP BY book_id
      ) recent_views ON book.id = recent_views.book_id

      -- Подсчет уникальных пользователей за 3 дня
      LEFT JOIN (
        SELECT
          book_id,
          COUNT(DISTINCT viewer_id) as unique_view_count
        FROM book_viewer
        WHERE created_at >= ?
        GROUP BY book_id
      ) unique_views ON book.id = unique_views.book_id

      -- Фильтруем только книги с активностью за последние 3 дня
      WHERE (recent_views.view_count > 0 OR unique_views.unique_view_count > 0)
        AND book.status IN ('progress', 'done')  -- Только опубликованные книги

      ORDER BY popularity_score DESC, recent_views.view_count DESC
      LIMIT ?
    `;

    const popularBooks = await storage.book.knex.raw(popularBooksQuery, [
      threeDaysAgo,
      threeDaysAgo,
      query?.limit || 20,
    ]);

    // Получаем результат в зависимости от типа БД
    const books = popularBooks.rows || popularBooks;

    if (books.length === 0) {
      // Если нет данных о просмотрах, возвращаем последние популярные книги
      const fallbackBooks = await storage.book.find(
        { status: ['progress', 'done'] },
        {
          limit: query?.limit || 20,
          order: { rate: 'desc', likers_count: 'desc' },
        },
      );

      await storage.book.attachGenres(fallbackBooks);
      const fallbackResult = fallbackBooks.map((book) =>
        storage.book.toPublic(book),
      );

      // Кэшируем fallback результат с меньшим TTL
      setCachedResult(cacheKey, fallbackResult);

      return fallbackResult;
    }

    // Обрабатываем книги через afterFetch для правильной обработки полей
    const processedBooks = books.map((book) =>
      storage.book.afterFetch({ ...book }),
    );

    // Прикрепляем жанры
    await storage.book.attachGenres(processedBooks);

    const result = processedBooks.map((book) => storage.book.toPublic(book));

    // Кэшируем результат
    setCachedResult(cacheKey, result);

    return result;
  } catch (err) {
    console.error('Ошибка получения популярных книг:', err);

    // В случае ошибки возвращаем последние популярные книги
    const books = await storage.book.find(
      { status: ['progress', 'done'] },
      {
        limit: query?.limit || 20,
        order: { rate: 'desc', likers_count: 'desc' },
      },
    );

    await storage.book.attachGenres(books);
    const errorResult = books.map((book) => storage.book.toPublic(book));

    // Не кэшируем результат ошибки, чтобы при следующем запросе попробовать снова
    return errorResult;
  }
});
