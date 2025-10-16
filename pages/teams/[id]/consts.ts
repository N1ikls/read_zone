import type { TabsItem } from '@nuxt/ui';

export const TABS: TabsItem[] = [
  {
    label: 'О команде',
    value: 'main',
    icon: '',
    slot: 'main' as const,
  },
  {
    label: 'Работы',
    value: 'work',
    icon: '',
    slot: 'work' as const,
  },
  {
    label: 'Заявки',
    value: 'request',
    icon: '',
    slot: 'request' as const,
  },
];
