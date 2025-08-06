import { RotationManager } from '../../../services/RotationManager.js';

export default defineApiHandler(async (event) => {
  try {
    const storage = event.context.storage;

    // Проверим что storage доступен
    if (!storage || !storage.knex) {
      return {
        success: false,
        message: 'Storage не доступен',
        data: null,
      };
    }

    // Парсим параметры запроса
    const query = getQuery(event);
    const { rotationKey = 'novelties' } = query;

    // Инициализируем RotationManager
    const rotationManager = new RotationManager(storage.knex);

    // Получаем статистику ротации
    const stats = await rotationManager.getRotationStats(rotationKey as string);

    if (stats) {
      return {
        success: true,
        message: 'Статистика ротации получена успешно',
        timestamp: new Date().toISOString(),
        data: stats,
      };
    } else {
      return {
        success: false,
        message: `Статистика для ротации "${rotationKey}" не найдена`,
        data: null,
      };
    }

  } catch (error) {
    console.error('[Admin API] Ошибка получения статистики ротации:', error);
    return {
      success: false,
      message: `Ошибка получения статистики ротации: ${error.message}`,
      data: null,
    };
  }
});
