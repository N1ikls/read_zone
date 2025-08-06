/**
 * API endpoint для получения статистики поиска
 * Доступен только для администраторов
 */

import searchLogger from '../../utils/search-logger.js';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  
  // Проверяем права доступа - только для администраторов
  const actor = event.context.actor;
  if (!actor || actor.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Доступ запрещен. Требуются права администратора.',
    });
  }

  try {
    // Получаем детальную статистику поиска
    const performanceReport = searchLogger.generatePerformanceReport();
    
    return {
      success: true,
      message: 'Статистика поиска получена успешно',
      timestamp: new Date().toISOString(),
      data: performanceReport,
      meta: {
        generatedAt: new Date().toISOString(),
        reportType: 'search_performance',
        version: '1.0',
      },
    };
  } catch (error) {
    console.error('Ошибка при получении статистики поиска:', error);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при получении статистики поиска',
    });
  }
});
