import type { BreadcrumbItem } from '@nuxt/ui';

const classes = 'text-[#999999] font-normal text-[15px]';
export const ROUTES: BreadcrumbItem[] = [
  {
    to: '/',
    label: 'Главная',
    class: classes,
  },
  {
    to: '/user',
    label: 'Профиль',
    class: classes,
  },
  {
    label: 'Мои работы',
    class: 'text-[#050505] font-normal text-[15px]',
  },
];
