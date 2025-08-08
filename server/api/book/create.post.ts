import errors from '../../utils/errors';

// Функция конвертации возрастного рейтинга из строкового формата в числовой
function convertAgeRating(ageRating: string): number {
  switch (ageRating) {
    case '0+':
      return 0;
    case '16+':
      return 16;
    case '18+':
      return 18;
    default:
      return 16; // значение по умолчанию
  }
}

// Функция конвертации возрастного рейтинга из числового формата в строковый
function convertAgeRatingToString(ageRate: number): string {
  switch (ageRate) {
    case 0:
      return '0+';
    case 16:
      return '16+';
    case 18:
      return '18+';
    default:
      return '16+';
  }
}

export default defineApiHandler(async (event: any) => {
  try {
    const storage = event.context.storage;
    const user = await event.context.context.user();

    if (!user) {
      throw new errors.Unauthorized('Необходима авторизация');
    }

    if (!user.id) {
      throw new errors.BadRequest('Некорректный ID пользователя');
    }

    const body = await readBody(event);

    if (!body.title) {
      throw new errors.BadRequest('Название книги обязательно');
    }

    // Проверяем, есть ли автор для этого пользователя, если нет - создаем
    let author = await storage.author.findOne({ created_by: user.id });
    if (!author) {
      // Создаем автора для пользователя
      author = await storage.author.save(
        {
          name: user.name || 'Автор',
          created_by: user.id,
        },
        user,
      );
    }

    // Создание книги через существующий storage
    const bookData = {
      name: body.title, // storage ожидает поле 'name' вместо 'title'
      description: body.description || '',
      status: 'progress', // используем правильные значения из storage
      type: 'manga', // обязательное поле - тип произведения (из enum)
      release_type: 'web', // обязательное поле - тип релиза
      year: Math.min(body.year || new Date().getFullYear(), 2024), // ограничение по максимальному году
      cover_image: body.cover_image || '/default-cover.jpg',
      age_rate: convertAgeRating(body.age_rating || '16+'), // конвертируем в числовой формат
      author_id: author.id, // ID созданного/найденного автора
      translator_id: user.id, // ID пользователя как переводчика
    };

    const book = await storage.book.save(bookData, user);

    // Добавление жанров, если указаны
    if (body.genre_ids && body.genre_ids.length > 0) {
      const genres = body.genre_ids.map((id: any) => ({ id }));
      await storage.book.setGenres(book, genres, user);
    }

    // Добавление тегов, если указаны
    if (body.tags && body.tags.length > 0) {
      // Создаем или находим теги по именам
      const tagObjects = [];
      for (const tagName of body.tags) {
        let tag = await storage.tag.findOne({ name: tagName.trim() });
        if (!tag) {
          tag = await storage.tag.save({ name: tagName.trim() }, user);
        }
        tagObjects.push({ id: tag.id });
      }
      await storage.book.setTags(book, tagObjects, user);
    }

    return {
      success: true,
      id: book.id, // фронтенд ожидает id на верхнем уровне для навигации
      book: {
        id: book.id,
        title: book.name, // возвращаем name как title для фронтенда
        description: book.description,
        status: book.status,
        age_rating: convertAgeRatingToString(book.age_rate), // конвертируем обратно в строковый формат
      },
    };
  } catch (error: any) {
    console.error('Ошибка создания книги:', error);
    console.error('Детали ошибки:', {
      message: error.message,
      errors: error.errors,
      stack: error.stack,
    });

    // Если это ошибка валидации базы данных, выводим детали
    if (error.constructor.name === 'DBValidation' && error.errors) {
      console.error('Ошибки валидации полей:');
      error.errors.forEach((err: any, index: number) => {
        console.error(`  ${index + 1}. Поле "${err.field}": ${err.message}`);
      });
    }

    if (
      error instanceof errors.BadRequest ||
      error instanceof errors.Unauthorized
    ) {
      throw error;
    }

    throw new errors.InternalServerError('Ошибка при создании книги');
  }
});
