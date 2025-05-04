<script setup lang="ts">
const slots = useSlots();
</script>

<template>
  <div class="main-layout">
    <header
      v-if="slots.header"
      class="r-page-layout__header"
    >
      <div class="wrapper">
        <slot name="header" />
      </div>
    </header>

    <main
      v-if="slots.default"
      class="r-page-layout__main"
    >
      <div class="wrapper">
        <slot />
      </div>
    </main>

    <footer
      v-if="slots.footer"
      class="r-page-layout__footer"
    >
      <div class="wrapper">
        <slot name="footer" />
      </div>
    </footer>
  </div>
</template>

<style lang="scss" scoped>
%transform {
  transition: all 0.3s ease-in-out;
}

.main-layout {
  @extend %transform;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #e0eaff;
}

.wrapper {
  @extend %transform;
  margin: 0 auto;
  padding: 0 16px;
  max-width: 1200px;
  height: 100%;

  @media (width > 500px) {
    padding: 0 36px;
  }

  @media (width > 520px) {
    padding: 0 56px;
  }

  @media (width > 630px) {
    padding: 0 106px;
  }

  &_wide {
    padding: 0;
  }
}

header {
  height: var(--header-height);
  background-color: #c5dcff;
  position: fixed;
  width: 100%;
  z-index: 1;
}

footer {
  margin-top: 60px;
  height: 750px;
  background-image: url('../../public/svg/footer.svg');
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
}

main {
  margin-top: var(--header-height);
}
// main {
//   margin-top: var(--header-height);
//   height: calc(100% - var(--header-height));
//   overflow: auto;
// }

%flex {
  display: flex;
}

.r-page-layout {
  @extend %flex;
  height: 100%;
  flex-direction: column;
  background-color: #fff;

  &__main {
    &-bg {
    }
  }

  &__header,
  &__extra {
    margin-bottom: 16px;
  }
}
</style>
