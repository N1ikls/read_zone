import BaseStorage from './base-storage.js';
import errors from '../utils/errors';
import NotificationHelper from '../utils/notification-helper.js';

export default class extends BaseStorage {
  get isDislikeable() {
    return true;
  }

  get publicProperties() {
    return [
      'id',
      'content',
      'created_at',
      'created_by',
      'user_name',
      'likers_count',
      'dislikers_count',
      'is_liked',
    ];
  }

  afterFetch(comment) {
    if ('is_liked' in comment)
      comment.is_liked =
        comment.is_liked === 1 ? true : comment.is_liked === 0 ? false : null;

    return comment;
  }

  beforeSave(comment, actor) {
    const data = {};

    if (comment.id) {
      data.updated_at = this.fixDate(new Date());
      data.updated_by = actor.id;
    } else {
      data.created_by = actor.id;

      if (!([this.entityIdProperty] in comment))
        throw new errors.DBValidation([{ message: 'Сущность не указана' }]);
      if (!('content' in comment))
        throw new errors.DBValidation([
          { field: 'content', message: 'Нет содержимого' },
        ]);
    }

    if (this.entityIdProperty in comment) {
      // Проверяем UUID (строка) или число
      const entityId = comment[this.entityIdProperty];
      const isValidUuid = typeof entityId === 'string' && entityId.length === 36 && /^[0-9a-f-]{36}$/i.test(entityId);
      const isValidNumber = typeof entityId === 'number' && entityId > 0;
      
      if (!isValidUuid && !isValidNumber) {
        throw new errors.DBValidation([
          { message: 'Неправильный идентификатор сущности' },
        ]);
      }
      data[this.entityIdProperty] = entityId;
    }

    if ('content' in comment) {
      if (typeof comment.content !== 'string')
        throw new errors.DBValidation([
          { field: 'content', message: 'Комментарий должен быть строкой' },
        ]);

      const content = comment.content.trim();
      if (content.length === 0)
        throw new errors.DBValidation([
          { field: 'content', message: 'Комментарий не может быть пустым' },
        ]);

      data.content = content;
    }

    return data;
  }

  preprocessSelectQuery(query, filter, options) {
    query
      .leftJoin('user', 'user.id', `${this.table}.created_by`)
      .select('user.name as user_name');

    const within = options.with || [];

    if (within.includes('is_liked') && options.actor) {
      const self = this;

      query
        .leftJoin(this.tableLiker, function () {
          this.on(`${self.tableLiker}.${self.table}_id`, `${self.table}.id`).on(
            `${self.tableLiker}.liker_id`,
            '=',
            self.knex.raw('?', [options.actor.id])
          );
        })
        .select(`${this.tableLiker}.positive as is_liked`);
    }
  }

  async save(comment, actor) {
    const isNewComment = !comment.id;
    const savedComment = await super.save(comment, actor);

    // Создаем уведомления для нового комментария
    if (isNewComment) {
      try {
        const notificationHelper = new NotificationHelper({
          user: { knex: this.knex },
          notification: {
            create: async (notificationData) => {
              return await this.knex('notifications').insert(notificationData);
            },
          },
        });

        // Определяем тип сущности и получаем её
        let targetEntity = null;
        let targetType = null;

        if (this.entityIdProperty === 'book_id') {
          targetEntity = await this.knex('book')
            .where('id', savedComment.book_id)
            .first();
          targetType = 'book';
        } else if (this.entityIdProperty === 'chapter_id') {
          targetEntity = await this.knex('chapter')
            .where('id', savedComment.chapter_id)
            .first();
          targetType = 'chapter';
        }

        if (targetEntity) {
          // Проверяем, это ответ на комментарий или новый комментарий
          if (savedComment.parent_id) {
            // Это ответ на комментарий
            const parentComment = await this.knex(this.table)
              .where('id', savedComment.parent_id)
              .first();

            if (parentComment) {
              await notificationHelper.notifyCommentReply(
                savedComment,
                parentComment,
                actor,
              );
            }
          } else {
            // Это новый комментарий к контенту
            await notificationHelper.notifyNewComment(
              savedComment,
              targetEntity,
              targetType,
              actor,
            );
          }
        }
      } catch (error) {
        console.error('Ошибка при создании уведомлений о комментарии:', error);
      }
    }

    return savedComment;
  }

  async like(entity, liker, positive = true) {
    const result = await super.like(entity, liker, positive);

    // Создаем уведомление о лайке комментария
    if (positive) {
      try {
        const notificationHelper = new NotificationHelper({
          user: { knex: this.knex },
          notification: {
            create: async (notificationData) => {
              return await this.knex('notifications').insert(notificationData);
            },
          },
        });

        await notificationHelper.notifyCommentLike(entity, liker);
      } catch (error) {
        console.error('Ошибка при создании уведомления о лайке:', error);
      }
    }

    return result;
  }
}
