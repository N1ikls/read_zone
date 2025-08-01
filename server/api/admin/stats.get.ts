import error from '../../utils/errors';

// Функция для получения реальной статистики доходов
async function getRevenueStats(storage: any) {
  try {
    // Доходы от продажи глав (из таблицы платежей)
    const chapterRevenue = await storage.user
      .knex('pay')
      .where('type', 'chapter_purchase')
      .where('status', 'completed')
      .sum('amount as total')
      .first();

    // Доходы от донатов
    const donationRevenue = await storage.user
      .knex('pay')
      .where('type', 'donation')
      .where('status', 'completed')
      .sum('amount as total')
      .first();

    // Доходы от подписок
    const subscriptionRevenue = await storage.user
      .knex('pay')
      .where('type', 'subscription')
      .where('status', 'completed')
      .sum('amount as total')
      .first();

    return {
      chapters: parseInt(chapterRevenue?.total || '0'),
      donations: parseInt(donationRevenue?.total || '0'),
      subscriptions: parseInt(subscriptionRevenue?.total || '0'),
    };
  } catch (err) {
    console.error('Ошибка получения статистики доходов:', err);
    // Возвращаем нули вместо заглушек
    return {
      chapters: 0,
      donations: 0,
      subscriptions: 0,
    };
  }
}

// Функция для получения реальной статистики расходов
async function getExpenseStats(storage: any) {
  try {
    // Расходы на рекламу (из таблицы расходов)
    const advertisingExpenses = await storage.user
      .knex('expenses')
      .where('type', 'advertising')
      .sum('amount as total')
      .first();

    // Расходы на серверы
    const serverExpenses = await storage.user
      .knex('expenses')
      .where('type', 'server')
      .sum('amount as total')
      .first();

    // Прочие расходы
    const otherExpenses = await storage.user
      .knex('expenses')
      .where('type', 'other')
      .sum('amount as total')
      .first();

    return {
      advertising: parseInt(advertisingExpenses?.total || '0'),
      server: parseInt(serverExpenses?.total || '0'),
      other: parseInt(otherExpenses?.total || '0'),
    };
  } catch (err) {
    console.error('Ошибка получения статистики расходов:', err);
    // Возвращаем нули вместо заглушек
    return {
      advertising: 0,
      server: 0,
      other: 0,
    };
  }
}

// Функция для получения реального количества уникальных посетителей
async function getUniqueVisitorsCount(storage: any) {
  try {
    // Пытаемся получить данные из таблицы site_visitors
    const uniqueVisitors = await storage.user
      .knex('site_visitors')
      .countDistinct('session_id as count')
      .first();

    // Если таблица site_visitors пуста, используем активность пользователей
    if (!uniqueVisitors?.count || uniqueVisitors.count === '0') {
      const allUniqueUsers = await storage.user.knex.raw(`
        SELECT COUNT(DISTINCT user_id) as count FROM (
          SELECT viewer_id as user_id FROM book_viewer
          UNION
          SELECT liker_id as user_id FROM book_liker
          UNION
          SELECT rater_id as user_id FROM book_rater
          UNION
          SELECT id as user_id FROM "user"
        ) as unique_users
      `);
      return { count: allUniqueUsers.rows?.[0]?.count || '0' };
    }

    return { count: uniqueVisitors.count };
  } catch (err) {
    console.error('Ошибка получения статистики посетителей:', err);
    // Fallback: используем количество зарегистрированных пользователей
    const fallback = await storage.user
      .knex('user')
      .count('* as count')
      .first();
    return fallback || { count: '0' };
  }
}

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  // Проверяем права администратора
  const user = await event.context.context.user();

  if (!user) {
    return new error.Unauthorized('Необходима авторизация');
  }

  if (user.role !== 'admin') {
    return new error.Forbidden(
      'Доступ запрещен. Требуются права администратора',
    );
  }

  try {
    // Получаем базовую статистику согласно ТЗ
    const stats = await Promise.all([
      // 1. Всего зарегистрированных пользователей
      storage.user.knex('user').count('* as count').first(),

      // 2. Всего опубликованных книг
      storage.book.knex('book').count('* as count').first(),

      // 3. Всего опубликованных глав
      storage.chapter.knex('chapter').count('* as count').first(),

      // 4. Всего команд
      storage.user.knex('team').count('* as count').first(),

      // 5. Всего уникальных посетителей (включая незарегистрированных)
      // Реальная система трекинга: объединяем зарегистрированных и анонимных посетителей
      getUniqueVisitorsCount(storage),

      // 5. Статистика по ролям пользователей
      storage.user
        .knex('user')
        .select('role')
        .count('* as count')
        .groupBy('role'),

      // 6. Статистика книг по статусам
      storage.book
        .knex('book')
        .select('status')
        .count('* as count')
        .groupBy('status'),

      // 7. Активность за последний месяц
      storage.chapter
        .knex('chapter')
        .where(
          'created_at',
          '>=',
          storage.chapter.knex.raw("NOW() - INTERVAL '1 MONTH'"),
        )
        .count('* as count')
        .first(),
    ]);

    const [
      totalUsers,
      totalBooks,
      totalChapters,
      totalTeams,
      uniqueVisitors,
      usersByRole,
      booksByStatus,
      chaptersLastMonth,
    ] = stats;

    return {
      // Основная статистика согласно ТЗ
      totalUsers: parseInt(totalUsers?.count || '0'),
      totalBooks: parseInt(totalBooks?.count || '0'),
      totalChapters: parseInt(totalChapters?.count || '0'),
      totalTeams: parseInt(totalTeams?.count || '0'),
      uniqueVisitors: parseInt(uniqueVisitors?.count || '0'), // всего посетителей сайта
      chaptersLastMonth: parseInt(chaptersLastMonth?.count || '0'),

      // Дополнительная статистика для диаграмм
      usersByRole: usersByRole.map((item: any) => ({
        role: item.role || 'user',
        count: parseInt(item.count),
      })),

      booksByStatus: booksByStatus.map((item: any) => ({
        status: item.status,
        count: parseInt(item.count),
      })),

      // Реальные финансовые данные из базы данных
      revenue: await getRevenueStats(storage),
      expenses: await getExpenseStats(storage),
    };
  } catch (err) {
    console.error('Ошибка получения статистики админ панели:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка получения статистики',
    });
  }
});
