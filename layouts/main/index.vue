<script setup lang="ts">
const slots = useSlots();

const route = useRoute();
</script>

<template>
  <div
    class="main-layout"
    :class="{ 'main-layout-bg': route.path === '/' }"
  >
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

  &-bg {
    background-color: #e0eaff;
  }
}

.wrapper {
  @extend %transform;
  margin: 0 auto;
  padding: 0 16px;
  max-width: 1330px;
  height: 100%;

  @media (width > 500px) {
    padding: 0 36px;
  }

  @media (width > 520px) {
    padding: 0 56px;
  }

  @media (width > 630px) {
    padding: 0 110px;
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
  z-index: 1000;
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
  flex: 1;
  padding-top: calc(100px + var(--header-height));
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

  &__user {
    background-color: #f5f5f5;
  }
}
</style>
