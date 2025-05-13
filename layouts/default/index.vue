<script setup lang="ts">
const slots = useSlots();
</script>

<template>
  <section
    v-if="slots?.breadcrumb"
    class="breadcrumb"
  >
    <slot name="breadcrumb" />

    <div class="title">
      <slot name="title" />
    </div>
  </section>

  <slot />
</template>

<style lang="scss" scoped>
.title {
  margin-top: 16px;
  margin-bottom: 60px;
}
</style>
