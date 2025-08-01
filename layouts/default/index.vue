<script setup lang="ts">
const slots = useSlots();
</script>

<template>
  <div class="wrapper">
    <div
      v-if="slots?.breadcrumb"
      class="r-page-layout__breadcrumb pt-[25px] xl:pt-[115px]"
    >
      <slot name="breadcrumb" />
    </div>

    <div
      v-if="slots?.title"
      class="r-page-layout__title my-2 md:my-4"
    >
      <div class="text-2xl leading-xl font-semibold text-foreground cs-text">
        <slot name="title" />
      </div>

      <slot name="title-extra" />
    </div>

    <section class="r-page-layout__section">
      <slot />
    </section>
  </div>
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

  &__breadcrumb {
    padding-top: 55px;
    margin-bottom: 16px;
  }
}
</style>
