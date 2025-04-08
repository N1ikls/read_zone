<script setup lang="ts">
const slots = useSlots();
</script>

<template>
  <div class="main-layout">
    <header
      v-if="slots.header"
      class="m-page-layout__header"
    >
      <div class="container-header">
        <slot name="header" />
      </div>
    </header>

    <main
      v-if="slots.default"
      class="r-page-layout__main"
    >
      <slot />
    </main>

    <footer
      v-if="slots.footer"
      class="r-page-layout__footer"
    >
      <div class="container">
        <slot name="footer" />
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.main-layout {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: #e0eaff;
}

header {
  height: var(--header-height);
  background-color: #c5dcff;
  position: fixed;
  width: 100%;
  z-index: 1;
}

main {
  margin-top: var(--header-height);
  height: calc(100% - var(--header-height));
  overflow: auto;
}

.container-header {
  display: flex;
  align-items: center;
  height: 100%;
}

%flex {
  display: flex;
}

.r-page-layout {
  @extend %flex;
  height: 100%;
  flex-direction: column;
  background-color: #fff;

  &__header,
  &__extra {
    margin-bottom: 16px;
  }

  &__main {
    flex: 1;
  }
}
</style>
