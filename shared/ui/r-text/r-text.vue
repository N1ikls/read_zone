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
    type: String as PropType<'normal' | 'default'>,
    default: 'default',
  },

  color: {
    type: Boolean as PropType<boolean>,
    default: false,
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
    class="m-text"
    :class="classes"
  >
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.r-text {
  margin: 0;
  padding: 0;
  color: #373737;
  font-family: 'GolosTextWebRegular';
  word-break: break-word;

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
    font-size: 18px;
  }

  &_v-large {
    font-size: 20px;
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
