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
