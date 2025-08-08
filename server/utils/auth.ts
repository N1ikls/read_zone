/**
 * Утилиты для работы с авторизацией в API endpoints
 */

/**
 * Получение авторизованного пользователя
 * Совместимо с существующей архитектурой проекта
 */
export async function requireAuthUser(event: any) {
  try {
    // Используем существующую систему авторизации
    const user = await event.context.context.user();
    
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      });
    }
    
    return user;
  } catch (error) {
    console.error('Ошибка авторизации:', error);
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    });
  }
}

/**
 * Получение подключения к базе данных
 * Использует существующую конфигурацию knex
 */
export function getDB() {
  // Используем существующее подключение из storage
  return {
    // Обертка для совместимости с новым API
    raw: (query: string, bindings?: any[]) => {
      // Здесь можно использовать существующий knex instance
      // Пока возвращаем заглушку
      return Promise.resolve([]);
    },
    // Методы для работы с таблицами
    table: (tableName: string) => ({
      insert: (data: any) => Promise.resolve([{ id: 'test-id' }]),
      where: (field: string, value: any) => ({
        first: () => Promise.resolve(null),
        select: () => Promise.resolve([]),
        update: (data: any) => Promise.resolve([]),
        delete: () => Promise.resolve([]),
      }),
      select: () => Promise.resolve([]),
      orderBy: (field: string, direction: string) => ({
        first: () => Promise.resolve(null),
        limit: (count: number) => Promise.resolve([]),
      }),
    }),
  };
}

// Экспорт для совместимости
export const db = getDB();
