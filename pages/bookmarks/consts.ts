import type { BreadcrumbItem } from '@nuxt/ui';

export const ROUTES: BreadcrumbItem[] = [
  {
    to: '/',
    label: 'Главная',
    class: 'text-[#999999] font-normal text-[15px]',
  },
  {
    to: '/user',
    label: 'Профиль',
    class: 'text-[#999999] font-normal text-[15px]',
  },
  {
    label: 'Закладки',
    class: 'text-[#050505] font-normal text-[15px]',
  },
];
