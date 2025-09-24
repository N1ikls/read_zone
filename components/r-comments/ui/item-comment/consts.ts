import type { DropdownMenuItem } from '@nuxt/ui';

export const ITEMS = [
  {
    label: 'Пожаловаться',
    slot: 'report' as const,
  },
] satisfies DropdownMenuItem[];
