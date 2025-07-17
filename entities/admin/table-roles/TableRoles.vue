<script setup lang="ts">
import { h, resolveComponent } from 'vue';
import type { TableColumn, TableRow } from '@nuxt/ui';
import { ModalRoles } from './ui';

const UCheckbox = resolveComponent('UCheckbox');
const UButton = resolveComponent('UButton');
const modal = resolveComponent('ItemModal');
const UDropdownMenu = resolveComponent('UDropdownMenu');

const table = useTemplateRef('table');

const rowSelection = ref<Record<string, boolean>>({});

const data = ref([
  {
    id: '4600',
    name: 'MangaLover2007',
    userBy: '1',
    roles: 'Активен',
  },
  {
    id: '4600',
    name: 'MangaLover2007',
    userBy: '2',
    roles: 'Активен',
  },
  {
    id: '4600',
    name: 'MangaLover2007',
    userBy: '3',
    roles: 'Завершен',
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
    accessorKey: 'userBy',
    header: 'Назначен',
  },
  {
    accessorKey: 'roles',
    header: 'Роль',
  },
  {
    id: 'actions',
    meta: {
      class: {
        th: 'p-0 w-1',
        td: 'p-0 pr-4',
      },
    },
    cell: ({ row }) =>
      h(ModalRoles, {
        title: 'Права пользователя',
      }),
  },
];

function getRowItems(row: TableRow<unknown>) {
  return [
    {
      label: 'Жалобы',
      onSelect() {},
    },
    {
      label: 'Действие',
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
            root: 'min-w-[100px] lg:w-[300px] flex-1',
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
      </div>

      <div class="flex flex-wrap gap-4">
        <u-select
          placeholder="Назначен"
          size="lg"
          multiple
          :model-value="
            table?.tableApi?.getColumn('userBy')?.getFilterValue() as string[]
          "
          :items="items"
          :ui="{
            placeholder: 'text-highlighted font-semibold ',
            trailingIcon: 'text-highlighted',
            base: 'light:bg-[#FFFFFF] ring-0 rounded-[10px] min-w-[100px] font-semibold',
          }"
          @update:model-value="
            table?.tableApi?.getColumn('userBy')?.setFilterValue($event)
          "
        />

        <u-select
          placeholder="Роль"
          size="lg"
          multiple
          :items="items"
          :model-value="
            table?.tableApi?.getColumn('roles')?.getFilterValue() as string[]
          "
          :ui="{
            placeholder: 'text-highlighted font-semibold',
            trailingIcon: 'text-highlighted',
            base: 'light:bg-[#FFFFFF] ring-0 rounded-[10px] min-w-[100px] font-semibold ',
          }"
          @update:model-value="
            table?.tableApi?.getColumn('roles')?.setFilterValue($event)
          "
        />
      </div>
    </div>

    <UTable
      ref="table"
      sticky
      :data="data"
      :columns="columns"
      :ui="{
        thead: 'bg-[none]',
        th: 'font-light',
        td: 'text-highlighted text-[15px]',
      }"
    />
  </div>
</template>
