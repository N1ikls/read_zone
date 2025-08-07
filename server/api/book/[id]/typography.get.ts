import errors from '../../../utils/errors';

export default defineApiHandler(async (event: any) => {
  try {
    const storage = event.context.storage;
    const user = await event.context.context.user();

    if (!user) {
      throw new errors.Unauthorized('Необходима авторизация');
    }

    const bookId = getRouterParam(event, 'id');

    if (!bookId) {
      throw new errors.BadRequest('Идентификатор книги не указан');
    }

    // Проверяем, что книга существует
    const book = await storage.book.findOne({ id: bookId });
    if (!book) {
      throw new errors.NotFound('Книга не найдена');
    }

    // Проверяем права доступа (автор может читать настройки своей книги)
    if (book.author_id !== user.id) {
      throw new errors.Forbidden('Нет прав для просмотра настроек этой книги');
    }

    // Получаем настройки типографики
    const settings = await storage.book.getTypographySettings(bookId);

    // Возвращаем настройки или значения по умолчанию
    return (
      settings || {
        font: 'Georgia',
        fontSize: 16,
        lineHeight: 1.5,
        letterSpacing: 0,
        wordSpacing: 0,
        textAlign: 'justify',
        marginTop: 20,
        marginBottom: 20,
        paragraphIndent: 20,
      }
    );
  } catch (error) {
    if (
      error instanceof errors.BadRequest ||
      error instanceof errors.Unauthorized ||
      error instanceof errors.NotFound ||
      error instanceof errors.Forbidden
    ) {
      throw error;
    }

    console.error('Ошибка получения настроек типографики:', error);
    throw new errors.InternalServerError('Внутренняя ошибка сервера');
  }
});
