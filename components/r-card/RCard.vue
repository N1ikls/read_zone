<template>
  <div class="r-card">
    <div class="r-card__content">
      <img src="../../public/test.png" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.r-card {
  display: inline-block;
  position: relative;
  background-color: #ffffff;
  height: 372px;
  width: 264px;
  border-radius: 35px;
  transition: width 0.4s ease;

  // &:hover {
  //   width: 264px;
  // }

  img {
    position: absolute;
    height: 100%;
    width: 100%;
    inset: 0px;
    color: transparent;
    object-fit: cover;
    border-radius: 35px;
  }
}
</style>
