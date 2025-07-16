<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn, TableRow } from '@nuxt/ui';
import { ItemModal } from './ui';

const UCheckbox = resolveComponent('UCheckbox');
const UButton = resolveComponent('UButton');
const UDropdownMenu = resolveComponent('UDropdownMenu');

const table = useTemplateRef('table');

const rowSelection = ref<Record<string, boolean>>({});

const data = ref([
  {
    id: '4600',
    name: 'MangaLover2007',
    date: '13.07.2025-18.07.2025',
    status: 'Активен',
    reason: 'Оскорбление',
  },
  {
    id: '4600',
    name: 'MangaLover2007',
    date: '13.07.2025-18.07.2025',
    status: 'Завершен',
    reason: 'Неуважение',
  },
  {
    id: '4600',
    name: 'MangaLover2007',
    date: '13.07.2025-18.07.2025',
    status: 'Завершен',
    reason: 'Оскорбление',
  },
]);

const columns: TableColumn<unknown>[] = [
  {
    accessorKey: 'name',
    header: 'Никнейм пользователя',
    meta: {
      class: {
        td: 'font-bold text-[18px]',
      },
    },
  },
  {
    accessorKey: 'date',
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

function getRowItems(row: TableRow<unknown>) {
  return [
    {
      label: 'Copy payment ID',
      onSelect() {},
    },
    {
      label: 'View customer',
    },
    {
      label: 'View payment details',
    },
  ];
}

const items = ['145625'];
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
            table?.tableApi?.getColumn('name')?.getFilterValue() as string
          "
          class="max-w-sm"
          placeholder="Романтика"
          @update:model-value="
            table?.tableApi?.getColumn('name')?.setFilterValue($event)
          "
        >
          <template
            v-if="table?.tableApi?.getColumn('name')?.getFilterValue()"
            #trailing
          >
            <UButton
              color="neutral"
              variant="link"
              size="sm"
              icon="i-lucide-circle-x"
              aria-label="Clear input"
              @click="table?.tableApi?.getColumn('name')?.setFilterValue('')"
            />
          </template>
        </UInput>

        <u-select
          placeholder="Статус"
          size="lg"
          multiple
          :model-value="
            table?.tableApi?.getColumn('status')?.getFilterValue() as string[]
          "
          :items="items"
          :ui="{
            placeholder: 'text-highlighted font-semibold ',
            trailingIcon: 'text-highlighted',
            base: 'light:bg-[#FFFFFF] ring-0 rounded-[10px] min-w-[100px] font-semibold',
          }"
          @update:model-value="
            table?.tableApi?.getColumn('status')?.setFilterValue($event)
          "
        />

        <u-select
          placeholder="Причина"
          size="lg"
          multiple
          :items="items"
          :model-value="
            table?.tableApi?.getColumn('reason')?.getFilterValue() as string[]
          "
          :ui="{
            placeholder: 'text-highlighted font-semibold',
            trailingIcon: 'text-highlighted',
            base: 'light:bg-[#FFFFFF] ring-0 rounded-[10px] min-w-[100px] font-semibold ',
          }"
          @update:model-value="
            table?.tableApi?.getColumn('reason')?.setFilterValue($event)
          "
        />

        <u-select
          placeholder="Дата и время"
          size="lg"
          multiple
          :items="items"
          :model-value="
            table?.tableApi?.getColumn('date')?.getFilterValue() as string[]
          "
          :ui="{
            placeholder: 'text-highlighted font-semibold',
            trailingIcon: 'text-highlighted',
            base: 'light:bg-[#FFFFFF] ring-0 rounded-[10px] min-w-[100px] font-semibold ',
          }"
          @update:model-value="
            table?.tableApi?.getColumn('date')?.setFilterValue($event)
          "
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

        <item-modal />
      </div>
    </div>

    <UTable
      ref="table"
      sticky
      v-model:row-selection="rowSelection"
      :data="data"
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
