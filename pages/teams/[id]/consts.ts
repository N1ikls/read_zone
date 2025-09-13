import type { TabsItem } from '@nuxt/ui';

export const TABS: TabsItem[] = [
  {
    label: 'О команде',
    value: 'main',
    icon: 'my-icons:list-statistic',
    slot: 'main' as const,
  },
  {
    label: 'Работы',
    value: 'work',
    icon: 'my-icons:models',
    slot: 'work' as const,
  },
  {
    label: 'Новости',
    value: 'news',
    icon: 'my-icons:ban-list',
    slot: 'news' as const,
  },
];
