import { requireModerator } from '../../../../utils/admin';

export default defineApiHandler(async (event) => {
  const storage = event.context.storage;
  const complaintId = getRouterParam(event, 'id');

  // Проверяем права модератора или администратора
  await requireModerator(event);

  if (!complaintId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID жалобы обязателен',
    });
  }

  try {
    // Получаем жалобу
    const complaint = await storage.user
      .knex('complaints')
      .where('id', complaintId)
      .first();

    if (!complaint) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Жалоба не найдена',
      });
    }

    // Определяем доступные действия в зависимости от типа жалобы
    const availableActions = [];

    // Действия по пользователю (если есть target_user_id)
    if (complaint.target_user_id) {
      availableActions.push(
        {
          id: 'ban_user',
          label: 'Забанить пользователя',
          description: 'Постоянный бан пользователя',
          severity: 'high'
        },
        {
          id: 'mute_user',
          label: 'Заглушить пользователя',
          description: 'Временный запрет на комментарии (7 дней)',
          severity: 'medium'
        },
        {
          id: 'warning',
          label: 'Предупреждение',
          description: 'Отправить предупреждение пользователю',
          severity: 'low'
        }
      );
    }

    // Действия по контенту (автоматически применяются при принятии жалобы)
    const contentActions = [];

    switch (complaint.type) {
      case 'comment':
        contentActions.push({
          id: 'delete_comment',
          label: 'Удалить комментарий',
          description: 'Комментарий будет удален автоматически',
          automatic: true
        });
        break;
        
      case 'book':
        contentActions.push({
          id: 'delete_book',
          label: 'Удалить книгу',
          description: 'Книга будет помечена как удаленная',
          automatic: true
        });
        break;
        
      case 'chapter':
        contentActions.push({
          id: 'delete_chapter',
          label: 'Удалить главу',
          description: 'Глава будет помечена как удаленная',
          automatic: true
        });
        break;
        
      case 'user':
        // Для жалоб на пользователей нет контента для удаления
        break;
    }

    return {
      success: true,
      data: {
        complaint: {
          id: complaint.id,
          type: complaint.type,
          reason: complaint.reason,
          status: complaint.status,
          target_user_id: complaint.target_user_id,
          target_comment_id: complaint.target_comment_id,
          target_book_id: complaint.target_book_id,
          target_chapter_id: complaint.target_chapter_id,
        },
        availableActions: availableActions,
        contentActions: contentActions,
        statusOptions: [
          {
            id: 'resolved',
            label: 'Принята',
            description: 'Жалоба обоснована, контент будет удален'
          },
          {
            id: 'rejected',
            label: 'Отклонена',
            description: 'Жалоба необоснована'
          }
        ]
      }
    };

  } catch (error: any) {
    console.error('Ошибка при получении действий по жалобе:', error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при получении действий по жалобе',
    });
  }
});
