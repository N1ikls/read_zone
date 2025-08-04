// Helper класс для создания уведомлений
export default class NotificationHelper {
  constructor(storage) {
    this.storage = storage;
  }

  // Уведомление о новой книге от подписки
  async notifyNewBook(book, author) {
    try {
      // Получаем всех подписчиков автора
      const subscribers = await this.storage.user.knex('user_subscriber')
        .where('user_id', author.id)
        .select('subscriber_id');

      if (!subscribers.length) return;

      const notifications = subscribers.map(sub => ({
        user_id: sub.subscriber_id,
        type: 'user_new_book',
        title: 'Новая книга от автора',
        message: `Автор "${author.name}" опубликовал новую книгу "${book.name}"`,
        related_entity_id: book.id,
        related_entity_type: 'book',
        metadata: {
          author_name: author.name,
          book_title: book.name,
          book_id: book.id,
          author_id: author.id
        }
      }));

      await this.storage.notification.createBulk(notifications);
      console.log(`📚 Создано ${notifications.length} уведомлений о новой книге "${book.name}"`);
    } catch (error) {
      console.error('Ошибка при создании уведомлений о новой книге:', error);
    }
  }

  // Уведомление о новой главе от подписки
  async notifyNewChapter(chapter, book, author) {
    try {
      // Получаем подписчиков автора
      const authorSubscribers = await this.storage.user.knex('user_subscriber')
        .where('user_id', author.id)
        .select('subscriber_id');

      // Получаем пользователей с закладками на эту книгу
      const bookmarkUsers = await this.storage.user.knex('bookmark')
        .where('book_id', book.id)
        .select('user_id');

      // Объединяем и убираем дубликаты
      const allUserIds = new Set([
        ...authorSubscribers.map(s => s.subscriber_id),
        ...bookmarkUsers.map(b => b.user_id)
      ]);

      if (!allUserIds.size) return;

      const notifications = Array.from(allUserIds).map(userId => {
        const isAuthorSubscriber = authorSubscribers.some(s => s.subscriber_id === userId);
        const hasBookmark = bookmarkUsers.some(b => b.user_id === userId);

        return {
          user_id: userId,
          type: isAuthorSubscriber ? 'user_new_chapter' : 'book_new_chapter',
          title: isAuthorSubscriber ? 'Новая глава от автора' : 'Новая глава в закладке',
          message: `В книге "${book.name}" появилась новая глава "${chapter.name}"`,
          related_entity_id: chapter.id,
          related_entity_type: 'chapter',
          metadata: {
            author_name: author.name,
            book_title: book.name,
            chapter_title: chapter.name,
            chapter_number: chapter.number,
            book_id: book.id,
            chapter_id: chapter.id,
            is_author_subscriber: isAuthorSubscriber,
            has_bookmark: hasBookmark
          }
        };
      });

      await this.storage.notification.createBulk(notifications);
      console.log(`📖 Создано ${notifications.length} уведомлений о новой главе "${chapter.name}"`);
    } catch (error) {
      console.error('Ошибка при создании уведомлений о новой главе:', error);
    }
  }

  // Уведомление об изменении статуса книги
  async notifyBookStatusChange(book, author, oldStatus, newStatus) {
    try {
      // Получаем подписчиков автора
      const subscribers = await this.storage.user.knex('user_subscriber')
        .where('user_id', author.id)
        .select('subscriber_id');

      if (!subscribers.length) return;

      const statusMessages = {
        'completed': 'завершена',
        'paused': 'приостановлена',
        'cancelled': 'отменена',
        'ongoing': 'возобновлена'
      };

      const statusText = statusMessages[newStatus] || newStatus;

      const notifications = subscribers.map(sub => ({
        user_id: sub.subscriber_id,
        type: 'user_book_status',
        title: 'Изменение статуса книги',
        message: `Книга "${book.name}" автора "${author.name}" ${statusText}`,
        related_entity_id: book.id,
        related_entity_type: 'book',
        metadata: {
          author_name: author.name,
          book_title: book.name,
          old_status: oldStatus,
          new_status: newStatus,
          book_id: book.id,
          author_id: author.id
        }
      }));

      await this.storage.notification.createBulk(notifications);
      console.log(`📊 Создано ${notifications.length} уведомлений об изменении статуса книги "${book.name}"`);
    } catch (error) {
      console.error('Ошибка при создании уведомлений об изменении статуса:', error);
    }
  }

  // Уведомление о новом комментарии к контенту
  async notifyNewComment(comment, targetEntity, targetType, commenter) {
    try {
      let targetUserId = null;
      let title = '';
      let message = '';

      if (targetType === 'book') {
        targetUserId = targetEntity.author_id;
        title = 'Новый комментарий к книге';
        message = `Пользователь "${commenter.name}" оставил комментарий к вашей книге "${targetEntity.name}"`;
      } else if (targetType === 'chapter') {
        // Получаем книгу для главы
        const book = await this.storage.book.findOne({ id: targetEntity.book_id });
        if (book) {
          targetUserId = book.author_id;
          title = 'Новый комментарий к главе';
          message = `Пользователь "${commenter.name}" оставил комментарий к главе "${targetEntity.name}" в книге "${book.name}"`;
        }
      }

      if (!targetUserId || targetUserId === commenter.id) return; // Не уведомляем самого себя

      await this.storage.notification.create({
        user_id: targetUserId,
        type: 'comment_on_content',
        title,
        message,
        related_entity_id: comment.id,
        related_entity_type: 'comment',
        metadata: {
          commenter_name: commenter.name,
          commenter_id: commenter.id,
          target_entity_type: targetType,
          target_entity_id: targetEntity.id,
          comment_content: comment.content?.substring(0, 100) + (comment.content?.length > 100 ? '...' : '')
        }
      });

      console.log(`💬 Создано уведомление о комментарии от ${commenter.name}`);
    } catch (error) {
      console.error('Ошибка при создании уведомления о комментарии:', error);
    }
  }

  // Уведомление об ответе на комментарий
  async notifyCommentReply(reply, parentComment, replier) {
    try {
      if (!parentComment.created_by || parentComment.created_by === replier.id) return;

      await this.storage.notification.create({
        user_id: parentComment.created_by,
        type: 'comment_reply',
        title: 'Ответ на комментарий',
        message: `Пользователь "${replier.name}" ответил на ваш комментарий`,
        related_entity_id: reply.id,
        related_entity_type: 'comment',
        metadata: {
          replier_name: replier.name,
          replier_id: replier.id,
          parent_comment_id: parentComment.id,
          reply_content: reply.content?.substring(0, 100) + (reply.content?.length > 100 ? '...' : '')
        }
      });

      console.log(`↩️ Создано уведомление об ответе на комментарий от ${replier.name}`);
    } catch (error) {
      console.error('Ошибка при создании уведомления об ответе:', error);
    }
  }

  // Уведомление о лайке комментария
  async notifyCommentLike(comment, liker) {
    try {
      if (!comment.created_by || comment.created_by === liker.id) return;

      await this.storage.notification.create({
        user_id: comment.created_by,
        type: 'comment_liked',
        title: 'Лайк комментария',
        message: `Пользователю "${liker.name}" понравился ваш комментарий`,
        related_entity_id: comment.id,
        related_entity_type: 'comment',
        metadata: {
          liker_name: liker.name,
          liker_id: liker.id,
          comment_content: comment.content?.substring(0, 100) + (comment.content?.length > 100 ? '...' : '')
        }
      });

      console.log(`❤️ Создано уведомление о лайке комментария от ${liker.name}`);
    } catch (error) {
      console.error('Ошибка при создании уведомления о лайке:', error);
    }
  }

  // Системное уведомление
  async notifySystem(userIds, type, title, message, metadata = {}) {
    try {
      if (!Array.isArray(userIds)) {
        userIds = [userIds];
      }

      const notifications = userIds.map(userId => ({
        user_id: userId,
        type,
        title,
        message,
        related_entity_id: null,
        related_entity_type: null,
        metadata
      }));

      await this.storage.notification.createBulk(notifications);
      console.log(`🔔 Создано ${notifications.length} системных уведомлений: ${title}`);
    } catch (error) {
      console.error('Ошибка при создании системного уведомления:', error);
    }
  }
}
