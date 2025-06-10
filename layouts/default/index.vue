<script setup lang="ts">
const slots = useSlots();
</script>

<template>
  <section
    v-if="slots?.breadcrumb"
    class="r-page-layout__breadcrumb"
  >
    <slot name="breadcrumb" />

    <div
      v-if="slots?.breadcrumb && slots?.title"
      class="r-page-layout__title"
    >
      <slot name="title" />
    </div>
  </section>

  <section class="r-page-layout__section">
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.r-page-layout {
  &__title {
    margin-top: 16px;
  }

  &__section {
    margin-top: 60px;
  }
}
</style>
