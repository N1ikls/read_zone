import { requireModerator } from '../../../../utils/admin';

export default defineApiHandler(async (event: any) => {
  const storage = event.context.storage;
  const complaintId = getRouterParam(event, 'id');

  // Проверяем права модератора или администратора
  const moderator = await requireModerator(event);

  const body = await readBody(event);
  const { status, admin_comment, action } = body;

  if (!complaintId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID жалобы обязателен',
    });
  }

  if (!status || !['resolved', 'rejected'].includes(status)) {
    throw createError({
      statusCode: 400,
      statusMessage:
        'Некорректный статус. Доступные статусы: resolved, rejected',
    });
  }

  try {
    // Проверяем существование жалобы
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

    if (complaint.status !== 'pending' && complaint.status !== 'in_progress') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Жалоба уже обработана',
      });
    }

    // Обновляем статус жалобы
    await storage.user
      .knex('complaints')
      .where('id', complaintId)
      .update({
        status,
        admin_comment: admin_comment || null,
        handled_by: moderator.id,
        updated_at: new Date(),
      });

    // Если жалоба принята, автоматически удаляем контент и применяем дополнительные действия
    if (status === 'resolved') {
      // Автоматически удаляем контент в зависимости от типа жалобы
      await handleComplaintAction(storage, complaint, `delete_${complaint.type}`, moderator);
      
      // Если указано дополнительное действие (бан, мут, предупреждение)
      if (action && action !== 'no_action') {
        await handleComplaintAction(storage, complaint, action, moderator);
      }
    }

    // Логируем действие модератора
    await storage.user.knex('admin_logs').insert({
      admin_id: moderator.id,
      action: 'resolve_complaint',
      target_user_id: complaint.target_user_id,
      details: `Обработана жалоба #${complaintId}: ${status}. ${admin_comment || ''}`,
      data: JSON.stringify({
        complaint_id: complaintId,
        complaint_type: complaint.type,
        resolution: status,
        action: action || null,
      }),
    });

    // Уведомляем пользователя, подавшего жалобу
    await storage.user.knex('notifications').insert({
      user_id: complaint.user_id,
      type: 'system_announcement',
      title: 'Жалоба обработана',
      message: `Ваша жалоба была ${status === 'resolved' ? 'принята' : 'отклонена'}. ${admin_comment || ''}`,
      metadata: JSON.stringify({
        complaint_id: complaintId,
        resolution: status,
        handled_by: moderator.name,
      }),
    });

    return {
      success: true,
      message: 'Жалоба успешно обработана',
      complaint: {
        id: complaintId,
        status,
        admin_comment,
        handled_by: moderator.name,
        action: action || null,
      },
    };
  } catch (err: any) {
    console.error('Ошибка при обработке жалобы:', err);

    if (err.statusCode) {
      throw err;
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Ошибка при обработке жалобы',
    });
  }
});

// Функция для выполнения действий по жалобе
async function handleComplaintAction(
  storage: any,
  complaint: any,
  action: string,
  moderator: any,
) {
  switch (action) {
    case 'ban_user':
      if (complaint.target_user_id) {
        await storage.user.knex('user_bans').insert({
          user_id: complaint.target_user_id,
          banned_by: moderator.id,
          type: 'ban',
          reason: `По жалобе #${complaint.id}: ${complaint.reason}`,
          expires_at: null, // Постоянный бан
          is_active: true,
        });
      }
      break;

    case 'mute_user':
      if (complaint.target_user_id) {
        await storage.user.knex('user_bans').insert({
          user_id: complaint.target_user_id,
          banned_by: moderator.id,
          type: 'mute',
          reason: `По жалобе #${complaint.id}: ${complaint.reason}`,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 дней
          is_active: true,
        });
      }
      break;

    case 'delete_comment':
      if (complaint.target_comment_id) {
        // Удаляем комментарий
        await storage.teamComment.knex('team_comment')
          .where('id', complaint.target_comment_id)
          .del();
      }
      break;

    case 'delete_book':
      if (complaint.target_book_id) {
        // Помечаем книгу как удаленную (не удаляем физически)
        await storage.book
          .knex('book')
          .where('id', complaint.target_book_id)
          .update({
            status: 'deleted',
            updated_at: new Date(),
          });
      }
      break;

    case 'delete_chapter':
      if (complaint.target_chapter_id) {
        // Помечаем главу как удаленную
        await storage.chapter
          .knex('chapter')
          .where('id', complaint.target_chapter_id)
          .update({
            status: 'deleted',
            updated_at: new Date(),
          });
      }
      break;

    case 'warning':
      if (complaint.target_user_id) {
        await storage.user.knex('notifications').insert({
          user_id: complaint.target_user_id,
          type: 'system_announcement',
          title: 'Предупреждение',
          message: `Вы получили предупреждение по жалобе: ${complaint.reason}`,
          metadata: JSON.stringify({
            complaint_id: complaint.id,
            type: 'warning',
          }),
        });
      }
      break;

    case 'no_action':
      break;
  }
}
