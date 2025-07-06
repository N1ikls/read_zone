<script lang="ts" setup>
import { parseISO, format } from 'date-fns';

const { item, checked = false } = defineProps<{
  checked: boolean;
  item: Record<string, string | number | boolean>;
}>();

const emit = defineEmits<{
  (e: 'checkbox-toggled', v: number): void;
}>();

const checkedItem = computed({
  get: () => {
    return checked;
  },
  set: () => {
    emit('checkbox-toggled', item.number);
  },
});
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-2">
      <div class="flex items-center text-xs font-medium gap-4">
        {{ item.volume || 1 }} Глава {{ item.number }}
      </div>
    </div>

    <div class="flex-row flex items-center gap-2">
      <div class="flex items-center gap-2">
        <p class="cs-text leading-xs text-xs font-medium">
          {{ format(parseISO(item.created_at as string), 'dd.MM.yyyy') }}
        </p>
      </div>

      <div class="ml-3">
        <u-checkbox
          color="info"
          size="lg"
          v-model="checkedItem"
          :ui="{
            base: 'ring-2 ring-[#0862E0]',
          }"
        />
      </div>
    </div>
  </div>
</template>
