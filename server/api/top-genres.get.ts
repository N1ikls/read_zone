// Production-ready «топ жанров» с кэшированием, валидацией и корректной агрегацией

// In-memory кэш (на инстанс). Для SSR этого достаточно; для горизонтального масштабирования нужен внешний кэш.
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 минут

function getCacheKey(limit: number, days: number) {
  return `top-genres:v1:limit=${limit}:days=${days}`;
}

function fromCache(key: string) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function toCache(key: string, data: any) {
  cache.set(key, { data, ts: Date.now() });
  // Лёгкая GC: держим не больше 20 записей
  if (cache.size > 20) {
    const firstKey = cache.keys().next().value as string | undefined;
    if (typeof firstKey === 'string') cache.delete(firstKey);
  }
}

export default defineApiHandler(async (event: any) => {
  const storage = event.context.storage;
  const query = getQuery(event) as { limit?: any; days?: any };

  // Валидация и безопасный парс параметров
  const limitRaw = Number(query?.limit ?? 20);
  const daysRaw = Number(query?.days ?? 30); // окно по просмотрам

  const limit = Number.isFinite(limitRaw)
    ? Math.min(Math.max(Math.trunc(limitRaw), 1), 50)
    : 20;
  const days = Number.isFinite(daysRaw)
    ? Math.min(Math.max(Math.trunc(daysRaw), 1), 365)
    : 30;

  const cacheKey = getCacheKey(limit, days);
  const cached = fromCache(cacheKey);
  if (cached) return cached;

  try {
    // Граница окна по просмотрам
    const since = new Date();
    since.setDate(since.getDate() - days);

    // Корректная агрегация через подзапросы по genre_id без дублирования
    const sql = `
      SELECT
        g.id,
        g.name,
        COALESCE(bg.books_count, 0) AS books_count,
        COALESCE(l.total_likes, 0) AS total_likes,
        COALESCE(v.recent_views, 0) AS recent_views,
        COALESCE(uv.unique_viewers, 0) AS unique_viewers,
        COALESCE(r.avg_rating, 0) AS avg_rating,
        (
          COALESCE(l.total_likes, 0) * 3.0 +
          COALESCE(v.recent_views, 0) * 1.0 +
          COALESCE(uv.unique_viewers, 0) * 2.0 +
          COALESCE(r.avg_rating, 0) * 10.0 +
          COALESCE(bg.books_count, 0) * 1.0
        ) AS popularity_score
      FROM genre g
      LEFT JOIN (
        SELECT bg.genre_id, COUNT(DISTINCT bg.book_id) AS books_count
        FROM book_genre bg
        JOIN book b ON b.id = bg.book_id AND b.status IN ('progress','done')
        GROUP BY bg.genre_id
      ) bg ON bg.genre_id = g.id
      LEFT JOIN (
        SELECT bg.genre_id, COUNT(*) AS total_likes
        FROM book_liker bl
        JOIN book_genre bg ON bg.book_id = bl.book_id
        GROUP BY bg.genre_id
      ) l ON l.genre_id = g.id
      LEFT JOIN (
        SELECT bg.genre_id, COUNT(*) AS recent_views
        FROM book_viewer bv
        JOIN book_genre bg ON bg.book_id = bv.book_id
        WHERE bv.created_at >= ?
        GROUP BY bg.genre_id
      ) v ON v.genre_id = g.id
      LEFT JOIN (
        SELECT bg.genre_id, COUNT(DISTINCT bv.viewer_id) AS unique_viewers
        FROM book_viewer bv
        JOIN book_genre bg ON bg.book_id = bv.book_id
        WHERE bv.created_at >= ?
        GROUP BY bg.genre_id
      ) uv ON uv.genre_id = g.id
      LEFT JOIN (
        SELECT bg.genre_id, AVG(br.rate) AS avg_rating
        FROM book_rater br
        JOIN book_genre bg ON bg.book_id = br.book_id
        GROUP BY bg.genre_id
      ) r ON r.genre_id = g.id
      WHERE COALESCE(bg.books_count, 0) > 0
      ORDER BY popularity_score DESC
      LIMIT ?
    `;

    const raw = await storage.genre.knex.raw(sql, [since, since, limit]);
    const rows = raw?.rows || raw; // PG / SQLite совместимость

    // Дополнительно подтянем последние обложки для каждого жанра (до 5)
    const genresWithBooks = await Promise.all(
      rows.map(async (genre: any) => {
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
          .whereIn('book.status', ['progress', 'done'])
          .orderBy('book.created_at', 'desc')
          .limit(5);

        return {
          id: genre.id,
          name: genre.name,
          books_count: Number(genre.books_count) || 0,
          total_likes: Number(genre.total_likes) || 0,
          recent_views: Number(genre.recent_views) || 0,
          unique_viewers: Number(genre.unique_viewers) || 0,
          avg_rating: Number(genre.avg_rating) || 0,
          popularity_score: Number(genre.popularity_score) || 0,
          recent_books: recentBooks,
        };
      }),
    );

    toCache(cacheKey, genresWithBooks);
    return genresWithBooks;
  } catch (err) {
    console.error('[top-genres] Ошибка:', err);

    // Фолбэк — просто список жанров (не кэшируем ошибку)
    const genres = await storage.genre.find({}, { limit, toPublic: true });
    return genres;
  }
});
