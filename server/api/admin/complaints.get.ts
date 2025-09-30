import { requireModerator } from '../../utils/admin';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;

  // Проверяем права модератора или администратора
  await requireModerator(event);

  const {
    page = 1,
    limit = 20,
    status = 'all',
    type = 'all',
  } = getQuery(event);

  try {
    let query = storage.user
      .knex('complaints')
      .select([
        'complaints.*',
        'reporter.name as reporter_name',
        'reporter.email as reporter_email',
        'target_user.name as target_user_name',
        'target_user.email as target_user_email',
        'book.name as target_book_title',
        'chapter.name as target_chapter_title',
        'handler.name as handler_name',
      ])
      .leftJoin('user as reporter', 'complaints.user_id', 'reporter.id')
      .leftJoin(
        'user as target_user',
        'complaints.target_user_id',
        'target_user.id',
      )
      .leftJoin('book', 'complaints.target_book_id', 'book.id')
      .leftJoin('chapter', 'complaints.target_chapter_id', 'chapter.id')
      .leftJoin('user as handler', 'complaints.handled_by', 'handler.id');

    // Фильтр по статусу
    if (status !== 'all') {
      query = query.where('complaints.status', status);
    }

    // Фильтр по типу
    if (type !== 'all') {
      query = query.where('complaints.type', type);
    }

    // Подсчет общего количества
    const totalQuery = storage.user.knex('complaints');
    
    // Применяем те же фильтры
    if (status !== 'all') {
      totalQuery.where('complaints.status', status);
    }
    if (type !== 'all') {
      totalQuery.where('complaints.type', type);
    }
    
    const total = await totalQuery.count('* as count').first();

    // Пагинация
    const offset = (Number(page) - 1) * Number(limit);
    const complaints = await query
      .orderBy('complaints.created_at', 'desc')
      .limit(Number(limit))
      .offset(offset);

    // Статистика по жалобам
    const stats = await Promise.all([
      // Общее количество жалоб
      storage.user.knex('complaints').count('* as count').first(),

      // Жалобы по статусам
      storage.user
        .knex('complaints')
        .select('status')
        .count('* as count')
        .groupBy('status'),

      // Жалобы по типам
      storage.user
        .knex('complaints')
        .select('type')
        .count('* as count')
        .groupBy('type'),

      // Жалобы за последний месяц
      storage.user
        .knex('complaints')
        .where(
          'created_at',
          '>=',
          storage.user.knex.raw("NOW() - INTERVAL '1 MONTH'"),
        )
        .count('* as count')
        .first(),
    ]);

    const [
      totalComplaints,
      complaintsByStatus,
      complaintsByType,
      complaintsLastMonth,
    ] = stats;

    return {
      complaints,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: parseInt(total?.count || '0'),
        totalPages: Math.ceil(parseInt(total?.count || '0') / Number(limit)),
      },
      stats: {
        total: parseInt(totalComplaints?.count || '0'),
        lastMonth: parseInt(complaintsLastMonth?.count || '0'),
        byStatus: complaintsByStatus.map((item) => ({
          status: item.status,
          count: parseInt(item.count),
        })),
        byType: complaintsByType.map((item) => ({
          type: item.type,
          count: parseInt(item.count),
        })),
      },
    };
  } catch (err) {
    console.error('Ошибка получения списка жалоб:', err);
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка получения списка жалоб',
    });
  }
});
