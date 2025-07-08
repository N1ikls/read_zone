import type { BreadcrumbItem } from '@nuxt/ui';
import type { ButtonsOptionsFabric } from '~/shared/types';

export const ROUTES: BreadcrumbItem[] = [
  {
    to: '/',
    label: 'Главная',
  },
  {
    to: '/user',
    label: 'Профиль',
  },
  {
    label: 'Закладки',
    class: 'text-[#050505] font-normal text-[15px]',
  },
];
