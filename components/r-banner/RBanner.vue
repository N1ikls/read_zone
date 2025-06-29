<template>
  <div class="banner w-full mb-5">
    <span class="relative">
      <img
        class="w-full object-cover"
        src="../../public/test_banner_2.png"
      />

      <div class="banner__text select-none absolute left-10 bottom-5">
        <p class="text-[#F8F8F8] font-bold asp mb-1">
          <slot />
        </p>

        <p class="text-[#F8F8F8] text-[14px] mono">Более 100 манг</p>
      </div>

      <div class="banner__actions select-none absolute right-10 bottom-7">
        <u-button
          icon="my-icons:arrow"
          class="w-[52px] h-[52px] rounded-full justify-center bg-[#C5DCFF] hover:bg-[none] cursor-pointer"
        />
      </div>
    </span>
  </div>
</template>

<style lang="scss" scoped>
.banner {
  span {
    img {
      border: 1px solid #0862e0;
      border-radius: 22px;
      height: 190px;
    }

    &::after {
      content: '';
      position: absolute;
      bottom: 0px;
      left: 0;
      right: 0px;
      height: 100%;
      background: linear-gradient(
        1.27deg,
        #091837 -13.9%,
        rgba(9, 24, 55, 0) 128.1%
      );
      border-radius: 22px;
    }
  }

  &__text,
  &__actions {
    z-index: 1;
  }
}
.asp {
  font-family: 'Aspa', sans-serif;
  font-size: 40px;
  text-transform: uppercase;
  line-height: 100%;
}

.mono {
  font-family: 'Montserrat', sans-serif;
  font-weight: 300;
}
</style>
