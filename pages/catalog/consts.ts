import type { BreadcrumbItem } from '@nuxt/ui';

export enum Status {
  'discarded' = 'discarded',
  'done' = 'Завершенный',
  'frozen' = 'Заморожено',
  'progress' = 'В процессе',
}

export const ROUTES: BreadcrumbItem[] = [
  {
    to: '/',
    label: 'Главная',
  },
  {
    label: 'Каталог',
  },
];
