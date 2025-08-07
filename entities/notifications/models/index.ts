export type NotificationType =
  | 'comment'
  | 'book_update'
  | 'system'
  | 'team'
  | 'report'
  | 'follow';

export interface Notification {
  id: string; // UUID
  user_id: string; // UUID (ссылка на пользователя)
  created_at: Date;
  type: NotificationType;
  title: string;
  content: string;
  data: Record<string, any> | null; // или более конкретный тип, если известна структура
  is_read: boolean;
}

// Для создания нового уведомления (без id и created_at, так как они генерируются автоматически)
export interface CreateNotificationDTO
  extends Omit<Notification, 'id' | 'created_at' | 'is_read'> {
  is_read?: boolean; // необязательное, так как есть значение по умолчанию
}
