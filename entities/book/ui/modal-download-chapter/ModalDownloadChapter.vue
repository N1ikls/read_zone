<script setup lang="ts">
import { useVirtualList } from '@vueuse/core';

import { parseISO, format } from 'date-fns';
import { TEXT_DOWNLOAD } from '../../consts';
import type { Chapter } from '~/shared/types';

const { items = [] } = defineProps<{
  items: Chapter[];
}>();

const open = ref<boolean>(false);

const { guidsChecked, isAllChecked, toggleGuid, toggleAll } =
  useGuidsChecked(items);

const { list, containerProps, wrapperProps } = useVirtualList(items, {
  itemHeight: 20,
  overscan: 10,
});

const onNegative = () => {
  open.value = false;
};

const onPositive = () => {
  open.value = false;
};

watch(open, (newValue) => {
  if (newValue) return;
  guidsChecked.clear();
});
</script>

<template>
  <u-modal
    v-model:open="open"
    :ui="{
      content:
        'grid gap-4 rounded-[10px] divide-y-0 p-7  max-sm:max-w-[calc(100vw-8px)] sm:max-w-2xl max-h-[559px]',
    }"
  >
    <u-button
      class="text-sm font-bold light:bg-[#ffffff] light:text-[#050505] hover:bg-[none]"
      color="info"
    >
      {{ TEXT_DOWNLOAD }}

      <u-icon
        class="text-[21px] text-[#050505]"
        name="my-icons:arrow-up-right"
        mode="svg"
      />
    </u-button>

    <template #content>
      <div class="flex flex-wrap items-center justify-between">
        <span class="font-bold text-[22px]"> {{ TEXT_DOWNLOAD }}</span>

        <div
          class="text-xs flex items-center gap-4 pr-[7px]"
          @click.stop="toggleAll"
        >
          Выбрать все

          <u-checkbox
            color="info"
            size="lg"
            :model-value="isAllChecked"
            :ui="{
              base: 'ring-2 ring-[#0862E0]',
            }"
          />
        </div>
      </div>

      <div
        v-bind="containerProps"
        class="overflow-auto scrollbar"
      >
        <div
          v-bind="wrapperProps"
          class="grid gap-2"
        >
          <template
            v-for="{ index, data } in list"
            :key="index"
          >
            <div class="grid gap-2 grid-cols-[2fr_65px_32px]">
              <r-list-item
                :key="index"
                :guid="data.number"
                :checked="guidsChecked.has(data.number as number)"
                @checkbox-toggled="toggleGuid"
                checked-allowed
              >
                <template #title>
                  <span class="text-xs font-medium">
                    {{ data.name }}
                  </span>
                </template>

                <template #default>
                  <p class="cs-text leading-xs text-xs font-medium">
                    {{
                      format(parseISO(data.created_at as string), 'dd.MM.yyyy')
                    }}
                  </p>
                </template>
              </r-list-item>
            </div>
          </template>
        </div>
      </div>

      <div class="flex gap-2">
        <u-button
          variant="outline"
          class="font-bold"
          block
          color="info"
          @click="onNegative"
        >
          Отмена
        </u-button>

        <u-button
          class="font-bold"
          block
          color="info"
          @click="onPositive"
        >
          Скачать
        </u-button>
      </div>
    </template>
  </u-modal>
</template>

<style lang="scss" scoped>
.shadow {
  box-shadow: 0px 0px 4px 0px #59595940;
}
</style>
