<script setup lang="ts">
const props = defineProps({
  bold: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  italic: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  size: {
    type: String as PropType<'normal' | 'default' | 'large' | 'v-large'>,
    default: 'default',
  },

  sizeSvg: {
    type: Number as PropType<number>,
    default: 22,
  },

  color: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  icon: {
    type: String as PropType<string>,
    default: '',
  },

  ellipsis: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  inherit: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
});

const classes = computed(() => [
  `r-text_${props.size}`,
  {
    'r-text_bold': props.bold,
    'r-text_italic': props.italic,
    'r-text_inherit': props.inherit,
    'r-text_ellipsis': props.ellipsis,
  },
]);
</script>

<template>
  <div
    class="r-text"
    :class="classes"
  >
    <UIcon
      class="r-text__icon"
      :class="[`text-[${sizeSvg}px]`]"
      v-if="icon"
      :name="icon"
    />

    <slot />
  </div>
</template>

<style lang="scss" scoped>
.r-text {
  color: #050505;
  font-family: 'Lato' sans-serif;
  word-break: break-word;

  display: flex;
  align-items: center;
  gap: 8px;

  p {
    margin: 0;
    padding: 0;
  }

  &_ellipsis {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  &_smallest {
    font-size: 12px;
    line-height: 1.15;
  }

  &_small {
    font-size: 13px;
    line-height: 1.15;
  }

  &_default {
    font-size: 14px;
  }

  &_normal {
    font-size: 16px;
  }

  &_large {
    font-size: 20px;
    font-weight: 700;
  }

  &_v-large {
    font-size: 32px;
    font-weight: 700;
  }

  &_bold {
    font-weight: 700;
  }

  &_italic {
    font-style: italic;
  }

  &_inherit {
    font-size: inherit;
  }
}
</style>
