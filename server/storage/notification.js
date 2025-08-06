import BaseStorage from './base-storage.js';
import errors from '../utils/errors';

export default class extends BaseStorage {
  get table() {
    return 'notifications';
  }

  get settingsTable() {
    return 'user_notification_settings';
  }

  get groupsTable() {
    return 'notification_groups';
  }

  get publicProperties() {
    return [
      'id',
      'type',
      'title',
      'message',
      'is_read',
      'created_at',
      'related_entity_id',
      'related_entity_type',
      'metadata',
    ];
  }

  // Создание уведомления
  async create(notificationData) {
    const { user_id, type, title, message, related_entity_id, related_entity_type, metadata } = notificationData;

    // Проверяем настройки пользователя
    const settings = await this.getUserSettings(user_id);
    const settingKey = `${type}_enabled`;
    
    if (settings && settings[settingKey] === false) {
      // Пользователь отключил этот тип уведомлений
      return null;
    }

    const notification = {
      user_id,
      type,
      title,
      message,
      related_entity_id: related_entity_id || null,
      related_entity_type: related_entity_type || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
    };

    const [id] = await this.knex(this.table).insert(notification).returning('id');
    return await this.findOne({ id: id.id || id });
  }

  // Массовое создание уведомлений
  async createBulk(notifications) {
    if (!notifications.length) return [];

    const validNotifications = [];
    
    for (const notif of notifications) {
      const settings = await this.getUserSettings(notif.user_id);
      const settingKey = `${notif.type}_enabled`;
      
      if (!settings || settings[settingKey] !== false) {
        validNotifications.push({
          ...notif,
          related_entity_id: notif.related_entity_id || null,
          related_entity_type: notif.related_entity_type || null,
          metadata: notif.metadata ? JSON.stringify(notif.metadata) : null,
        });
      }
    }

    if (!validNotifications.length) return [];

    await this.knex(this.table).insert(validNotifications);
    return validNotifications.length;
  }

  // Получение уведомлений пользователя
  async getUserNotifications(userId, options = {}) {
    const { page = 1, limit = 20, unread_only = false } = options;
    const offset = (page - 1) * limit;

    let query = this.knex(this.table)
      .where('user_id', userId)
      .orderBy('created_at', 'desc');

    if (unread_only) {
      query = query.where('is_read', false);
    }

    const notifications = await query
      .limit(limit)
      .offset(offset)
      .select('*');

    return notifications.map(notification => {
      if (notification.metadata) {
        try {
          notification.metadata = JSON.parse(notification.metadata);
        } catch (e) {
          notification.metadata = null;
        }
      }
      return notification;
    });
  }

  // Подсчет непрочитанных уведомлений
  async getUnreadCount(userId) {
    const result = await this.knex(this.table)
      .where({ user_id: userId, is_read: false })
      .count('* as count')
      .first();
    
    return parseInt(result.count) || 0;
  }

  // Пометка уведомлений как прочитанных
  async markAsRead(userId, notificationIds = null) {
    let query = this.knex(this.table)
      .where('user_id', userId)
      .update({ is_read: true });

    if (notificationIds) {
      if (Array.isArray(notificationIds)) {
        query = query.whereIn('id', notificationIds);
      } else {
        query = query.where('id', notificationIds);
      }
    }

    return await query;
  }

  // Удаление уведомления
  async deleteNotification(userId, notificationId) {
    return await this.knex(this.table)
      .where({ user_id: userId, id: notificationId })
      .delete();
  }

  // Получение настроек уведомлений пользователя
  async getUserSettings(userId) {
    const settings = await this.knex(this.settingsTable)
      .where('user_id', userId)
      .first();

    if (!settings) {
      // Создаем настройки по умолчанию
      await this.createDefaultSettings(userId);
      return await this.knex(this.settingsTable)
        .where('user_id', userId)
        .first();
    }

    return settings;
  }

  // Создание настроек по умолчанию
  async createDefaultSettings(userId) {
    const defaultSettings = {
      user_id: userId,
      user_new_book_enabled: true,
      user_new_chapter_enabled: true,
      user_book_status_enabled: true,
      book_new_chapter_enabled: true,
      book_updated_enabled: true,
      book_rating_changed_enabled: false,
      comment_reply_enabled: true,
      comment_on_content_enabled: true,
      comment_liked_enabled: false,
      system_moderation_enabled: true,
      system_announcement_enabled: true,
      system_maintenance_enabled: true,
      email_notifications_enabled: false,
      email_digest_enabled: false,
      email_digest_frequency: 'weekly',
    };

    await this.knex(this.settingsTable)
      .insert(defaultSettings)
      .onConflict('user_id')
      .ignore();
  }

  // Обновление настроек уведомлений
  async updateUserSettings(userId, settings) {
    const allowedSettings = [
      'user_new_book_enabled', 'user_new_chapter_enabled', 'user_book_status_enabled',
      'book_new_chapter_enabled', 'book_updated_enabled', 'book_rating_changed_enabled',
      'comment_reply_enabled', 'comment_on_content_enabled', 'comment_liked_enabled',
      'system_moderation_enabled', 'system_announcement_enabled', 'system_maintenance_enabled',
      'email_notifications_enabled', 'email_digest_enabled', 'email_digest_frequency'
    ];

    const filteredSettings = {};
    for (const key of allowedSettings) {
      if (key in settings) {
        filteredSettings[key] = settings[key];
      }
    }

    if (Object.keys(filteredSettings).length === 0) {
      throw new errors.BadRequest('Нет валидных настроек для обновления');
    }

    filteredSettings.updated_at = new Date();

    await this.knex(this.settingsTable)
      .where('user_id', userId)
      .update(filteredSettings);

    return await this.getUserSettings(userId);
  }

  // Очистка старых уведомлений
  async cleanupOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const deletedCount = await this.knex(this.table)
      .where('created_at', '<', cutoffDate)
      .where('is_read', true)
      .delete();

    return deletedCount;
  }

  // Получение статистики уведомлений
  async getNotificationStats(userId) {
    const stats = await this.knex(this.table)
      .where('user_id', userId)
      .select('type')
      .count('* as count')
      .sum(this.knex.raw('CASE WHEN is_read = false THEN 1 ELSE 0 END as unread_count'))
      .groupBy('type');

    const totalUnread = await this.getUnreadCount(userId);
    const totalCount = await this.knex(this.table)
      .where('user_id', userId)
      .count('* as count')
      .first();

    return {
      total: parseInt(totalCount.count) || 0,
      unread: totalUnread,
      by_type: stats
    };
  }
}
