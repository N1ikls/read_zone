<script setup lang="ts">
const props = defineProps({
  level: {
    type: String as PropType<'1' | '2' | '3' | '4' | '5' | '6'>,
    default: '1',
  },

  bold: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  medium: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  bottom: {
    type: String as PropType<string>,
    default: '45px',
  },

  center: {
    type: Boolean as PropType<boolean>,
    default: false,
  },

  inherit: {
    type: Boolean as PropType<boolean>,
    default: false,
  },
});

const is = computed(() => `h${props.level}`);

const classes = computed(() => ({
  'r-header_bold': props.bold,
  'r-header_medium': props.medium,
  'r-header_center': props.center,
  'r-header_inherit': props.inherit,
}));
</script>

<template>
  <component
    :is="is"
    class="r-header"
    :class="classes"
  >
    <slot />
  </component>
</template>

<style lang="scss" scoped>
.r-header {
  margin: 0;
  padding: 0;
  line-height: 100%;
  letter-spacing: 0.015em;
  padding-bottom: v-bind(bottom);
  font-family: 'Aspa', sans-serif;

  &_medium {
    font-weight: 600;
  }

  &_center {
    text-align: center;
  }

  &_ellipsis {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  &_inherit {
    font-size: inherit;
  }
}

h1 {
  font-size: 70px;
}

h2 {
  font-size: 22px;
  line-height: 32px;
}

h3 {
  font-size: 20px;
  line-height: 1.2;

  @media screen and (max-width: 1024px) {
    font-size: 18px;
  }
}

h4 {
  font-size: 18px;
  line-height: 28px;
}

h5 {
  font-size: 16px;
  line-height: 18px;
}

h6 {
  font-size: 13px;
  line-height: 16px;
}
</style>
