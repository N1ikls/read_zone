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

export const BUTTONS = [
  {
    name: 'О тайтле',
    link: '',
    icon: 'my-icons:lists',
    class: 'text-[#1E1E1E]',
    classIcon: 'text-[20px]',
  },
  {
    name: 'Главы',
    link: '',
    icon: 'my-icons:read',
    class: 'text-[#050505]',
    classIcon: 'text-[20px] stroke-[2px]',
  },
  {
    name: 'Обсуждения',
    link: '',
    icon: 'my-icons:notification',
    class: 'text-[#050505]',
    classIcon: 'text-[20px]',
  },
  {
    name: 'Ошибки',
    link: '',
    icon: 'my-icons:errors',
    class: 'text-[#050505]',
    classIcon: 'text-[18px]',
  },
];
