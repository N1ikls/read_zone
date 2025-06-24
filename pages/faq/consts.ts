import type { AccordionItem, BreadcrumbItem } from '@nuxt/ui';

const classes = 'text-[#999999] font-normal text-[15px]';
export const ROUTES: BreadcrumbItem[] = [
  {
    to: '/',
    label: 'Главная',
    class: classes,
  },
  {
    label: 'FAQ',
    class: 'text-[#050505] font-normal text-[15px]',
  },
];

export const ITEMS: AccordionItem[] = [
  {
    label: 'Как создать перевод на сайте readzone.ru',

    content: 'You have nothing to do, @nuxt/icon will handle it automatically.',
  },
  {
    label: 'Как создать перевод на сайте readzone.ru',

    content:
      'Choose a primary and a neutral color from your Tailwind CSS theme.',
  },
  {
    label: 'Как создать перевод на сайте readzone.ru',

    content:
      'You can customize components by using the `class` / `ui` props or in your app.config.ts.',
  },
];
