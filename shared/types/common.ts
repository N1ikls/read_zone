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
  status: 'discarded' | 'ongoing' | 'completed' | 'hiatus';
  source_status: 'discarded' | 'ongoing' | 'completed' | 'hiatus';
  translator_id: string;
  translator_name: string;
  type: 'oel' | 'translation' | string;
  viewers_count: number;
  year: number;
  rate_counts: RateCounts;
}

export interface Chapter {}

export interface CatalogResponse {
  total: number;
  page: number;
  limit: number;
  items: Book[];
}
