import error from './errors';

/**
 * Утилита для проверки прав администратора
 * Используется в API endpoints для защиты админских функций
 */
export async function requireAdmin(event: any) {
  const user = await event.context.context.user();

  if (!user) {
    throw new error.Unauthorized('Необходима авторизация');
  }

  if (user.role !== 'admin') {
    throw new error.Forbidden(
      'Доступ запрещен. Требуются права администратора',
    );
  }

  return user;
}

/**
 * Утилита для проверки прав модератора или администратора
 * Используется в API endpoints для защиты модераторских функций
 */
export async function requireModerator(event: any) {
  const user = await event.context.context.user();

  if (!user) {
    throw new error.Unauthorized('Необходима авторизация');
  }

  if (user.role !== 'admin' && user.role !== 'moderator') {
    throw new error.Forbidden(
      'Доступ запрещен. Требуются права модератора или администратора',
    );
  }

  return user;
}
