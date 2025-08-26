import errors from '../../utils/errors';

export default defineApiHandler(async (event: any) => {
  try {
    const storage = event.context.storage;
    const user = await event.context.context.user();

    // Проверяем авторизацию
    if (!user) {
      throw new errors.Unauthorized('Необходима авторизация');
    }

    if (!user.id) {
      throw new errors.BadRequest('Некорректный ID пользователя');
    }

    // Проверим что storage доступен
    if (!storage || !storage.team) {
      throw new errors.InternalServerError('Storage не доступен');
    }

    const body = await readBody(event);

    // Валидация обязательных полей
    if (!body.name) {
      throw new errors.BadRequest('Название команды обязательно');
    }

    if (typeof body.name !== 'string' || body.name.trim().length === 0) {
      throw new errors.BadRequest(
        'Название команды должно быть непустой строкой',
      );
    }

    // Проверяем, не существует ли уже команда с таким названием
    const existingTeam = await storage.team.findOne({ name: body.name.trim() });
    if (existingTeam) {
      throw new errors.BadRequest('Команда с таким названием уже существует');
    }

    // Подготавливаем данные для создания команды
    const teamData: any = {
      name: body.name.trim(),
    };

    // Добавляем описание, если указано
    if (body.description !== undefined) {
      if (body.description === null || body.description === '') {
        teamData.description = null;
      } else if (typeof body.description === 'string') {
        teamData.description = body.description.trim() || null;
      } else {
        throw new errors.BadRequest('Описание должно быть строкой или null');
      }
    }

    // Добавляем аватар, если указан
    if (body.avatar !== undefined) {
      if (body.avatar === null || body.avatar === '') {
        teamData.avatar = null;
      } else if (typeof body.avatar === 'string') {
        teamData.avatar = body.avatar;
      } else {
        throw new errors.BadRequest('Аватар должен быть строкой или null');
      }
    }

    // Добавляем фон, если указан
    if (body.background !== undefined) {
      if (body.background === null || body.background === '') {
        teamData.background = null;
      } else if (typeof body.background === 'string') {
        teamData.background = body.background;
      } else {
        throw new errors.BadRequest('Фон должен быть строкой или null');
      }
    }

    // Создаем команду через storage
    const team = await storage.team.save(teamData, user);

    // Получаем полную информацию о созданной команде
    const fullTeam = await storage.team.findOne(
      { id: team.id },
      { toPublic: true },
    );

    // Получаем участников команды (создатель автоматически становится участником)
    let teammates = [];
    if (fullTeam.created_by) {
      teammates = await storage.team.getTeammates(fullTeam);
    }

    // Получаем книги команды (пока пустой массив для новой команды)
    const books = await storage.team.getBooks(fullTeam);

    return {
      success: true,
      message: 'Команда создана успешно',
      timestamp: new Date().toISOString(),
      data: {
        team: {
          ...fullTeam,
          teammates_count: teammates?.length || 0,
          books_count: books?.length || 0,
          teammates: teammates || [],
          books: books || [],
        },
      },
    };
  } catch (error: any) {
    console.error('Ошибка создания команды:', error);
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

    // Возвращаем соответствующие ошибки
    if (
      error instanceof errors.BadRequest ||
      error instanceof errors.Unauthorized ||
      error instanceof errors.InternalServerError
    ) {
      throw error;
    }

    // Если это ошибка валидации из storage
    if (error.constructor.name === 'DBValidation') {
      throw new errors.BadRequest(
        error.message || 'Ошибка валидации данных команды',
      );
    }

    throw new errors.InternalServerError('Ошибка при создании команды');
  }
});
