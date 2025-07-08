<script
  setup
  lang="ts"
  generic="T extends string, V extends ComponentTypeEmits"
>
import type { ComponentTypeEmits } from 'vue';
import type { ButtonsOptionsFabric } from '~/shared/types';

type OptionEvent = {
  key: string | number;
};

const { options = [] } = defineProps<{
  options: ButtonsOptionsFabric<T>[];
}>();

const emits = defineEmits<{
  (e: 'option-event', payload: OptionEvent): void;
}>();

const emitHandler = (payload: OptionEvent) => {
  emits('option-event', payload);
};
</script>

<template>
  <div class="buttons-layout">
    <template
      v-for="button in options"
      :key="button.key"
    >
      <u-button
        :id="button.key"
        :color="button.color"
        :class="button.class"
        :icon="button.icon"
        @click="emitHandler({ key: button.key })"
      >
        {{ button.text }}
      </u-button>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.buttons-layout {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
