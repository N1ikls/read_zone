import type { DropdownMenuItem } from '@nuxt/ui';
import type { Chapter } from '~/shared/types';
import type { UseChaptersActions } from './types';

export const useChaptersActions = ({ refresh }: UseChaptersActions) => {
  const toast = useToast();

  const deleteChapter = async (
    guid: string,
    number: number | string | number[] | string[],
  ) => {
    try {
      await $fetch('/api/chapter/delete', {
        method: 'post',
        query: {
          guid,
          number,
        },
      });

      refresh();

      toast.add({ title: 'Удалено', color: 'primary', duration: 1500 });
    } catch (e) {
      toast.add({ title: 'Ошибка', color: 'error' });
    }
  };

  const onBlockedOrUnlock = async (item: Chapter) => {
    try {
      await $fetch('/api/chapter/blocked', {
        method: 'post',
        query: {
          is_public: !item.is_public,
          guid: item.book_id,
          number: item.number,
        },
      });

      refresh();

      toast.add({
        title: item.is_public ? 'Глава заблокирована' : 'Глава разблокирована',
        color: 'success',
      });
    } catch (e) {
      toast.add({ title: 'Ошибка', color: 'error' });
    }
  };

  const edit = (item: Chapter) => {
    navigateTo(`/chapter/${item.id}/editor`);
  };

  const options = (item: Chapter): DropdownMenuItem[] => [
    {
      label: 'Редактировать',
      icon: 'i-lucide-edit',
      color: 'info',
      onSelect: () => edit(item),
    },
    {
      label: item.is_public ? 'Заблокировать' : 'Разблокировать',
      icon: item.is_public ? 'my-icons:lock' : 'i-lucide-lock-keyhole-open',
      color: 'info',
      onSelect: async () => await onBlockedOrUnlock(item),
    },
    {
      label: 'Удалить',
      icon: 'i-lucide-trash',
      color: 'error',
      onSelect: async () => await deleteChapter(item.book_id, item.number),
    },
  ];

  return { options, deleteChapter };
};
