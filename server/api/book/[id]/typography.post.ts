import errors from '../../../utils/errors';

export default defineApiHandler(async (event: any) => {
  try {
    const storage = event.context.storage;
    const user = await event.context.context.user();

    if (!user) {
      throw new errors.Unauthorized('Необходима авторизация');
    }

    const bookId = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!bookId) {
      throw new errors.BadRequest('Идентификатор книги не указан');
    }

    // Проверяем, что книга принадлежит пользователю
    const book = await storage.book.findOne({ id: bookId });
    if (!book) {
      throw new errors.NotFound('Книга не найдена');
    }

    if (book.author_id !== user.id) {
      throw new errors.Forbidden('Нет прав для редактирования этой книги');
    }

    // Валидация настроек типографики
    const typographySettings = {
      font: body.font || 'Georgia',
      fontSize: Number(body.fontSize) || 16,
      lineHeight: Number(body.lineHeight) || 1.5,
      letterSpacing: Number(body.letterSpacing) || 0,
      wordSpacing: Number(body.wordSpacing) || 0,
      textAlign: body.textAlign || 'justify',
      marginTop: Number(body.marginTop) || 20,
      marginBottom: Number(body.marginBottom) || 20,
      paragraphIndent: Number(body.paragraphIndent) || 20,
    };

    // Сохраняем настройки типографики в базе данных
    // Предполагаем, что у нас есть таблица book_typography_settings
    await storage.book.updateTypographySettings(bookId, typographySettings);

    return {
      success: true,
      message: 'Настройки типографики сохранены',
      settings: typographySettings,
    };
  } catch (error) {
    if (
      error instanceof errors.BadRequest ||
      error instanceof errors.Unauthorized ||
      error instanceof errors.NotFound ||
      error instanceof errors.Forbidden
    ) {
      throw error;
    }

    console.error('Ошибка сохранения настроек типографики:', error);
    throw new errors.InternalServerError('Внутренняя ошибка сервера');
  }
});
