<script setup lang="ts">
import { ItemChapter } from './ui';
import { TEXT_DOWNLOAD } from '../../consts';

const { items = [] } = defineProps<{
  items: Record<string, string | number | boolean>[];
}>();

const open = ref<boolean>(false);
const guidsChecked = reactive<Set<number>>(new Set());

const isAllChecked = computed(
  () => guidsChecked.size === items.length && items.length > 0,
);

const toggleGuid = (number: number) => {
  if (guidsChecked.has(number)) {
    guidsChecked.delete(number);

    return;
  }
  guidsChecked.add(number);
};

const toggleAll = () => {
  if (isAllChecked.value) {
    guidsChecked.clear();

    return;
  }

  items.forEach((item) => {
    guidsChecked.add(item.number);
  });
};

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
        'grid gap-4 rounded-[10px] divide-y-0 p-7  max-sm:max-w-[calc(100vw-8px)] sm:max-w-2xl h-[300px] xl:h-[559px]',
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
      <div class="flex flex-wrap items-center justify-between pr-3">
        <span class="font-bold text-[22px]"> {{ TEXT_DOWNLOAD }}</span>

        <div
          class="text-xs flex items-center gap-4"
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

      <div class="overflow-y-scroll scrollbar">
        <div class="grid gap-1 pr-3">
          <item-chapter
            v-for="(item, index) in items"
            :key="index"
            :item="item"
            :checked="guidsChecked.has(item.number as number)"
            @checkbox-toggled="toggleGuid"
          />
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
