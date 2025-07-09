import type { BreadcrumbItem } from '@nuxt/ui';

export const ROUTES: BreadcrumbItem[] = [
  {
    to: '/',
    label: 'Главная',
  },
  {
    to: '/catalog',
    label: 'Каталог',
  },
  {
    to: '/user',
    label: 'Тайтл',
  },
  {
    to: '/user',
    label: 'Главы',
  },
  {
    label: 'Режим переводчика',
    class: 'text-[#050505] font-normal text-[15px]',
  },
];
