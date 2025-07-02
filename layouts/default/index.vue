<script setup lang="ts">
const slots = useSlots();
</script>

<template>
  <div
    v-if="slots?.breadcrumb"
    class="r-page-layout__breadcrumb"
  >
    <slot name="breadcrumb" />
  </div>

  <div
    v-if="slots?.title"
    class="r-page-layout__title my-2 md:my-4"
  >
    <slot name="title" />

    <slot name="title-extra" />
  </div>

  <section class="r-page-layout__section">
    <slot />
  </section>
</template>

<style lang="scss" scoped>
.r-page-layout {
  &__title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 20px;
  }
}
</style>
