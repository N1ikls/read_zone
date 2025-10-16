import type { DropdownMenuItem } from '@nuxt/ui';

export const items = (id: string) =>
  [
    {
      label: 'Пожаловаться',
      slot: 'report' as const,
      onSelect: () => {
        console.log('id', id);
      },
    },
  ] satisfies DropdownMenuItem[];
