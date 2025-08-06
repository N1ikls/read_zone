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
    const body = await readBody(event);
    const { rotationKey = 'novelties' } = body;

    // Инициализируем RotationManager
    const rotationManager = new RotationManager(storage.knex);

    // Сбрасываем ротацию
    const resetResult = await rotationManager.resetRotation(rotationKey);

    if (resetResult) {
      console.log(`[Admin API] Rotation reset for ${rotationKey}`);
      
      return {
        success: true,
        message: `Ротация "${rotationKey}" успешно сброшена`,
        timestamp: new Date().toISOString(),
        data: {
          rotationKey,
          resetAt: new Date().toISOString(),
        },
      };
    } else {
      return {
        success: false,
        message: `Не удалось сбросить ротацию "${rotationKey}"`,
        data: null,
      };
    }

  } catch (error) {
    console.error('[Admin API] Ошибка сброса ротации:', error);
    return {
      success: false,
      message: `Ошибка сброса ротации: ${error.message}`,
      data: null,
    };
  }
});
