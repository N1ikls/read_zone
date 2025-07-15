import type { BreadcrumbItem } from '@nuxt/ui';

export const ROUTES: BreadcrumbItem[] = [
  {
    to: '/',
    label: 'Главная',
  },
  {
    to: '/user',
    label: 'Мой профиль',
  },
  {
    label: 'Панель администратора',
    class: 'text-[#050505] font-normal text-[15px]',
  },
];

export const TABS = [
  {
    label: 'Общая статистика',
    value: 'chart',
    slot: 'chart' as const,
    icon: 'my-icons:list-statistic',
  },
  {
    label: 'Модели',
    value: 'models',
    slot: 'models' as const,
    icon: 'my-icons:models',
  },
  {
    label: 'Бан-лист',
    value: 'banList',
    slot: 'banList' as const,
    icon: 'my-icons:ban-list',
  },
  {
    label: 'Запреты',
    value: 'blocked',
    slot: 'blocked' as const,
    icon: 'my-icons:blocked',
  },
  {
    label: 'Список жалоб',
    value: 'listOfComplaints',
    slot: 'listOfComplaints' as const,
    icon: 'my-icons:list-of-complaints',
  },
  {
    label: 'Права пользователей',
    value: 'roles',
    slot: 'roles' as const,
    icon: 'my-icons:tabs-list',
  },
  {
    label: 'Теневые работы',
    value: 'shadowWork',
    slot: 'shadowWork' as const,
    icon: 'my-icons:shadow-work',
  },
];
