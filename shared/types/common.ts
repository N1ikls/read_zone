export interface Genre {
  id: string;
  name: string;
}

export type RateCounts = {
  [key in '1' | '2' | '3' | '4' | '5']: number;
};

export interface Book {
  age_rate: string;
  alt_name: string | null;
  author_id: string;
  author_name: string;
  background: string | null;
  bookmarks_count: number;
  chapters_count: number;
  description: string;
  genres: Genre[];
  id: string;
  likers_count: number;
  name: string;
  rate: number;
  status: 'discarded' | 'done' | 'frozen' | 'progress';
  source_status: 'discarded' | 'ongoing' | 'completed' | 'hiatus';
  translator_id: string;
  translator_name: string;
  type: 'oel' | 'translation' | string;
  viewers_count: number;
  year: number;
  rate_counts: RateCounts;
  is_writeable: boolean;
}

export interface Chapter {
  id: string; // UUID формата
  book_id: string; // UUID формата
  number: number; // Номер главы
  name: string; // Название главы
  is_public: boolean; // Видимость главы
  price: number; // Цена главы
  volume: string; // Название тома
  status: 'discarded' | 'published' | 'draft' | 'archived'; // Статус главы
  created_at: string; // Дата создания в ISO формате
  updated_at: string; // Дата обновления в ISO формате
  likers_count: number; // Количество лайков
  viewers_count: number; // Количество просмотров
  is_liked: boolean; // Лайкнул ли текущий пользователь
}

export interface CatalogResponse {
  total: number;
  page: number;
  limit: number;
  items: Book[];
}

export interface User {
  id: string;
  created_at: string;
  updated_at: string | null;
  email: string;
  name: string;
  role: '' | 'admin' | 'moderator';
  avatar: string | null;
  email_subscription: boolean;
  books_count: number;
  chapters_in_month: number;
  likers_count: number;
  subscribers_count: number;
}

export interface Teammate extends User {
  team_role: 'creator' | 'admin' | '';
}

export interface TeamComment {
  id: string;
  created_at: string;
  created_by: string;
  likers_count: number;
  dislikers_count: number;
  content: string;
  user_name: string;
  is_liked: boolean | null;
  replies?: TeamComment[];
}

export interface CommentCreateData {
  content: string;
  team_id: string;
  parent_id?: string | null;
}

export interface CommentUpdateData {
  content: string;
}

export interface Team {
  id: string;
  name: string;
  description: string | null;
  avatar: string | null;
  background: string | null;
  created_at: string;
  updated_at: string | null;
  created_by: string;
  teammates_count: number;
  books_count: number;
  subscribers_count: number;
  likers_count: number;
  teammates: Teammate[];
  books: Book[];
  comments: TeamComment[];
  comments_count: number;
}

export interface TeamsApiRequest {
  guid?: string;
  offset?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface TeamsApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  items: {
    teams: Team[];
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
  meta: {
    pagination: {
      offset: number;
      limit: number;
      total: number;
      hasMore: boolean;
      nextOffset: number | null;
    };
    filters: {
      search: string | null;
      sort: string;
      order: string;
    };
  };
}

export interface TeamBooksApiRequest {
  offset?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: {
    types?: string[];
  };
}

export interface TeamBooksApiResponse {
  success: boolean;
  message: string;
  timestamp: string;
  items: {
    books: Book[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
  meta: {
    team: {
      id: string;
      name: string;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
      nextPage: number | null;
      totalPages: number;
    };
    filters: Record<string, any>;
  };
}
