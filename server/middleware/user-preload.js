// Middleware для предзагрузки пользователя
export default defineEventHandler(async (event) => {
  // Пропускаем статические файлы и API не требующие авторизации
  if (
    event.node.req.url?.startsWith('/_nuxt/') ||
    event.node.req.url?.startsWith('/api/auth/') ||
    event.node.req.url?.startsWith('/favicon.ico') ||
    event.node.req.url?.includes('.')
  ) {
    return;
  }

  // Предзагружаем пользователя для всех остальных запросов
  if (event.context.context && event.context.session?.user?.id) {
    try {
      // Асинхронно предзагружаем пользователя в фоне
      setImmediate(async () => {
        try {
          await event.context.context.user();
        } catch (error) {
          console.warn('User preload failed:', error.message);
        }
      });
    } catch (error) {
      // Игнорируем ошибки предзагрузки
      console.warn('User preload setup failed:', error.message);
    }
  }
});
