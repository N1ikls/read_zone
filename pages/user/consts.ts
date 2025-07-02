import type { BreadcrumbItem, TabsItem } from '@nuxt/ui';

export const ROUTES: BreadcrumbItem[] = [
  {
    to: '/',
    label: 'Главная',
    class: 'text-[#999999] text-[15px]',
  },
  {
    label: 'Профиль',
    class: 'text-[#050505] font-normal text-[15px]',
  },
];

export const ACTIONS_BUTTONS = [
  {
    name: 'В мастерскую',
    link: '',
    class: 'text-[#97BFFF]',
  },
  {
    name: 'Избранное',
    link: '',
    class: 'text-[#000000]',
  },
  {
    name: 'Подписки',
    link: '',
    class: 'text-[#000000]',
  },
];

export const TABS: TabsItem[] = [
  {
    label: 'Посты',
    icon: 'my-icons:read',
    slot: 'posts' as const,
  },
  {
    label: 'Команды',
    icon: 'my-icons:people',
  },
  {
    label: 'Подписки',
    icon: 'my-icons:people-group',
  },
  {
    label: 'Уведомления',
    icon: 'my-icons:notifications',
  },
];
