export interface Complaint {
  // Уникальный идентификатор жалобы
  id: string;

  // Идентификатор пользователя, который отправил жалобу
  user_id: string;

  // Идентификатор пользователя, на которого пожаловались
  target_user_id: string;

  // Идентификаторы целей жалобы (могут быть null)
  target_book_id: string | null;
  target_chapter_id: string | null;
  target_comment_id: string | null;

  created_at: string;
  updated_at: string | null;

  // Модератор, обработавший жалобу
  handled_by: string | null;

  // Тип жалобы (в данном случае "comment")
  type: 'user' | 'book' | 'chapter' | 'comment' | 'all';

  // Статус обработки жалобы
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected' | 'all';

  // Причина жалобы
  reason: string;

  // Комментарии
  admin_comment: string | null; // комментарий модератора
  comment: string | null; // дополнительный комментарий

  // Информация о reporter (жалобщике)
  reporter_name: string;
  reporter_email: string;

  // Информация о target user (пользователе, на которого пожаловались)
  target_user_name: string;
  target_user_email: string;

  // Информация о контенте (могут быть null)
  target_book_title: string | null;
  target_chapter_title: string | null;

  // Имя модератора, обработавшего жалобу
  handler_name: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface StatusCount {
  status: string;
  count: number;
}

interface TypeCount {
  type: string;
  count: number;
}

interface Stats {
  total: number;
  lastMonth: number;
  byStatus: StatusCount[];
  byType: TypeCount[];
}

export interface ComplaintsResponse {
  complaints: Complaint[];
  pagination: Pagination;
  stats: Stats;
}
