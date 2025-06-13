import type { BreadcrumbOptions } from '@/shared/types';
import type { BreadcrumbItem } from '@nuxt/ui';

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

export const FOOTER_BUTTONS = [
  {
    name: 'Посты',
    link: '',
    icon: 'my-icons:read',
    class: 'text-[#1E1E1E]',
    classIcon: 'stroke-[#1E1E1E] stroke-[0.5px]',
  },
  {
    name: 'Команды',
    link: '',
    icon: 'my-icons:people-black',
    class: 'text-[#050505]',
  },
  {
    name: 'Подписки',
    link: '',
    icon: 'my-icons:people-group',
    class: 'text-[#050505]',
  },
  {
    name: 'Уведомления',
    link: '',
    icon: 'my-icons:notification',
    class: 'text-[#050505]',
  },
];
