<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn, TableRow } from '@nuxt/ui';
import { ItemModal } from '../item-modal';
import type { Complaint, ComplaintsResponse } from '../types';
import { STATUS, statusLabels } from '../consts';
import { format } from 'date-fns';
import { debounce } from 'es-toolkit';

const UCheckbox = resolveComponent('UCheckbox');
const UButton = resolveComponent('UButton');
const UDropdownMenu = resolveComponent('UDropdownMenu');
const table = useTemplateRef('table');
const queries = useGetRouteQuery({
  status: 'all',
  page: 1,
  limit: 10,
});
const toast = useToast();
const setRouteQueries = useSetRouteQuery();
const debounceParsedQueries = ref(unref(queries));
const rowSelection = ref<Record<string, boolean>>({});
const statusValue = ref(splitQueryValue(queries.value.status));

const { data, refresh } = useFetch<ComplaintsResponse>(
  '/api/admin/complaints',
  {
    method: 'get',
    query: queries,
    transform: (reports) => {
      return {
        ...reports,
        complaints: reports?.complaints?.map((item) => ({
          ...item,
          status: statusLabels[item.status],
          created_at: format(new Date(item.created_at), 'dd.MM.yyyy HH:mm'),
        })),
      };
    },
  },
);

async function handleResolveComplaint(
  guid: string,
  action: 'ban_user' | 'mute_user' | 'warning' | 'delete_comment' | 'no_action',
  adminComment: string,
) {
  try {
    await $fetch(`/api/admin/complaints/${guid}/resolve`, {
      method: 'POST',
      body: {
        status: 'resolved',
        admin_comment: adminComment,
        action: action,
      },
    });

    toast.add({
      title: 'Жалоба успешно обработана',
    });

    refresh();
  } catch (error) {
    toast.add({ title: 'Ошибка при обработке жалобы' });
    console.error('Ошибка при обработке жалобы:', error);
  }
}

const columns: TableColumn<unknown>[] = [
  {
    accessorKey: 'target_user_name',
    header: 'Никнейм пользователя',
    meta: {
      class: {
        td: 'font-bold text-[18px]',
      },
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Дата и время',
  },
  {
    accessorKey: 'status',
    header: 'Статус',
  },
  {
    accessorKey: 'reason',
    header: 'Причина',
  },
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        'modelValue': table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all',
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        'modelValue': row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          row.toggleSelected(!!value),
        'aria-label': 'Select row',
      }),
  },

  {
    id: 'actions',
    meta: {
      class: {
        th: 'p-0 w-1',
        td: 'p-0 pr-4',
      },
    },
    cell: ({ row }) => {
      return h(
        'div',
        {},
        h(
          UDropdownMenu,
          {
            items: getRowItems(row),
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'info',
              variant: 'ghost',
              class: 'ml-auto',
            }),
        ),
      );
    },
  },
];

function onSelect(row: TableRow<unknown>, e?: Event) {
  row.toggleSelected(!row.getIsSelected());

  console.log(e);
}

function getRowItems(row: TableRow<Complaint>) {
  return [
    {
      label: 'Заблокировать',
      onSelect: () =>
        handleResolveComplaint(
          row.original.id,
          'ban_user',
          'Пользователь заблокирован',
        ),
    },
    {
      label: 'Заглушить',
      onSelect: () =>
        handleResolveComplaint(
          row.original.id,
          'mute_user',
          'Пользователь заблокирован',
        ),
    },
    {
      label: 'Вынести предупреждение',
      onSelect: () =>
        handleResolveComplaint(
          row.original.id,
          'warning',
          'Вынесено предупреждение',
        ),
    },
    {
      label: 'Удалить',
      onSelect: () =>
        handleResolveComplaint(
          row.original.id,
          'delete_comment',
          'Комментарий удален',
        ),
    },
  ];
}

const onUpdateArray = (key: string, value: string[] | string | Event) => {
  setRouteQueries(
    resetPaginationQuery({
      [key]: Array.isArray(value) ? value.join(',') : (value as string),
    }),
  );
};

watch(
  queries,
  debounce((newValue) => {
    debounceParsedQueries.value = newValue;
  }, 1000),
);
</script>

<template>
  <div class="flex flex-col flex-1 w-full light:bg-[#F5F5F5] rounded-[10px]">
    <div class="p-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap items-center gap-4">
        <UInput
          icon="i-lucide-search"
          size="lg"
          :ui="{
            root: 'min-w-[200px] w-[300px] flex-1',
            base: 'light:bg-[#FFFFFF] hover:bg-[none] ring-1 ring-[#C2C2C2] focus:bg-[none] placeholder:text-[#C2C2C2] placeholder:italic placeholder-text-base',
          }"
          variant="soft"
          :model-value="
            table?.tableApi
              ?.getColumn('target_user_name')
              ?.getFilterValue() as string
          "
          class="max-w-sm"
          placeholder="Никнейм"
          @update:model-value="
            table?.tableApi
              ?.getColumn('target_user_name')
              ?.setFilterValue($event)
          "
        >
          <template
            v-if="
              table?.tableApi?.getColumn('target_user_name')?.getFilterValue()
            "
            #trailing
          >
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-circle-x"
              aria-label="Clear input"
              @click="
                table?.tableApi
                  ?.getColumn('target_user_name')
                  ?.setFilterValue('')
              "
            />
          </template>
        </UInput>

        <u-select
          placeholder="Статус"
          size="lg"
          multiple
          v-model="statusValue"
          :items="STATUS"
          :ui="{
            placeholder: 'text-highlighted font-semibold ',
            trailingIcon: 'text-highlighted',
            base: 'light:bg-[#FFFFFF] ring-0 rounded-[10px] w-48 font-semibold',
          }"
          @update:model-value="(value: any) => onUpdateArray('status', value)"
        />
      </div>

      <div class="flex gap-4">
        <u-button
          variant="outline"
          color="info"
          class="rounded-[10px] text-highlighted"
          size="lg"
        >
          Удалить
        </u-button>

        <item-modal title="Забанить" />
      </div>
    </div>

    <UTable
      ref="table"
      sticky
      v-model:row-selection="rowSelection"
      :data="data?.complaints"
      :columns="columns"
      @select="onSelect"
      :ui="{
        thead: 'bg-[none]',
        th: 'font-light',
        td: 'text-highlighted text-[15px]',
      }"
    />
  </div>
</template>
