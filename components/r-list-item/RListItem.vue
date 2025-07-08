<script lang="ts" setup>
import { isEmpty } from 'es-toolkit/compat';
import type { DropdownMenuItem } from '@nuxt/ui';

const {
  guid,
  options = [],
  checked = false,
  checkedAllowed = false,
} = defineProps<{
  checked?: boolean;
  guid: string | number;
  checkedAllowed?: boolean;
  options?: DropdownMenuItem[];
}>();

const emit = defineEmits<{
  (e: 'checkbox-toggled', v: string | number): void;
}>();

const checkedItem = computed({
  get: () => {
    return checked;
  },
  set: () => {
    emit('checkbox-toggled', guid);
  },
});

const isOptions = computed(() => !isEmpty(options));
</script>

<template>
  <div class="flex items-center truncate">
    <slot name="title" />
  </div>

  <div class="flex items-center">
    <slot />
  </div>

  <u-checkbox
    v-if="checkedAllowed"
    color="info"
    size="lg"
    v-model="checkedItem"
    :ui="{
      root: 'justify-center items-center',
      base: 'ring-2  ring-[#0862E0]',
    }"
  />

  <UDropdownMenu
    v-if="isOptions"
    :items="options"
  >
    <UButton
      icon="i-lucide-ellipsis-vertical"
      color="info"
      variant="ghost"
      aria-label="Actions"
    />
  </UDropdownMenu>
</template>
