<script setup lang="ts">
const slots = useSlots();

const route = useRoute();
</script>

<template>
  <div class="main-layout">
    <header
      v-if="slots.header"
      class="r-page-layout__header bg-[var(--bg-header)]"
      :class="{
        'light:bg-[#ffffff] light:ring-2 light:ring-[#F5F5F5]':
          route.name === 'book-id',
      }"
    >
      <div class="wrapper">
        <slot name="header" />
      </div>
    </header>

    <main
      v-if="slots.default"
      class="r-page-layout__main min-h-screen"
      :class="{ 'bg-[--bg]': route.fullPath === '/' }"
    >
      <slot />
    </main>

    <footer
      v-if="slots.footer"
      class="r-page-layout__footer bg-[var(--bg)]"
      :class="{ 'light:bg-[#E0EAFF]': route.fullPath === '/' }"
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
}

.wrapper {
  @extend %transform;
  margin: 0 auto;
  padding: 0 16px;
  max-width: 1240px;
  height: 100%;

  &_wide {
    padding: 0;
  }
}

header {
  height: var(--header-height);
  backdrop-filter: blur(50px);
  position: fixed;
  width: 100%;
  z-index: 1000;
}

footer {
  padding-top: 60px;
  height: 750px;
  background-image: url('../../public/svg/footer.svg');
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
}

main {
  flex: 1;
  z-index: 1;
  padding-top: var(--header-height);
  background-color: var(--bg);
}

%flex {
  display: flex;
}

.r-page-layout {
  @extend %flex;
  height: 100%;
  flex-direction: column;
  background-color: #fff;
}
</style>
