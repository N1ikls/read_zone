<template>
  <div class="r-card">
    <div class="r-card__content">
      <img src="../../public/test.png" />
    </div>

    <div class="r-card__actions">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.r-card {
  display: inline-block;
  position: relative;
  background-color: #ffffff;
  height: 373px;
  width: 265px;
  border-radius: 35px;
  transition: width 0.4s ease;

  // &:hover {
  //   width: 264px;
  // }

  &__content {
    position: absolute;
    height: 100%;
    width: 100%;
    inset: 0px;
    color: transparent;

    img {
      width: inherit;
      height: 100%;
      object-fit: cover;
      border-radius: 35px;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: -1px;
      height: 50%;
      background: linear-gradient(to bottom, #1c3a7e00 0%, #1c3a7e 100%);
      border-bottom-left-radius: 35px;
      border-bottom-right-radius: 35px;
    }
  }

  &__actions {
    position: absolute;
    z-index: 1;
    color: #ffffff;
    font-family: 'Aspa', sans-serif;
    font-size: 43.8px;
    font-weight: 700;
    bottom: 30px;
    left: 30px;
  }
}
</style>
