import type { BreadcrumbItem } from '@nuxt/ui';

const classes = 'text-[#FFFFFF] hover:text-[none] font-normal text-[15px]';
export const ROUTES: BreadcrumbItem[] = [
  {
    to: '/',
    label: 'Главная',
    class: classes,
  },
  {
    to: '/catalog',
    label: 'Каталог',
    class: classes,
  },
  {
    label: 'Тайтл',
    class: 'text-[#FFFFFF] font-normal text-[15px]',
  },
];
