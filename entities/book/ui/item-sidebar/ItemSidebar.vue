<script lang="ts" setup></script>

<template>
  <div
    class="xs:max-w-[70vw] flex w-full max-w-[60vw] shrink-0 basis-3/5 flex-col gap-4 sm:max-w-[320px] sm:basis-1/2 md:sticky md:top-[76px] md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
  >
    <span
      class="relative inline-flex shrink-0 aspect-[2/3] w-full overflow-hidden rounded-[10px] select-none"
    >
      <img
        class="select-none size-full object-cover transition-all duration-200"
        src="../../../../public/test_grid.png"
      />
    </span>

    <div
      class="fresnel-container fresnel-greaterThanOrEqual-md fresnel-«r15v» p-0l z-[100] hidden w-full flex-col justify-between gap-2 md:flex"
    >
      <UButton
        class="p-2 h-10 rounded-[10px] font-bold text-lg cursor-pointer"
        color="info"
        block
      >
        Начать читать
      </UButton>

      <UButton
        class="text-[#050505] p-2 h-10 rounded-[10px] font-bold text-lg cursor-pointer"
        color="info"
        variant="outline"
        block
      >
        Добавить в планы
      </UButton>

      <UButton
        class="p-2 h-10 rounded-[10px] font-bold text-lg cursor-pointer"
        color="info"
        block
      >
        Забрать работу
      </UButton>

      <r-text
        class="justify-center warning cursor-pointer"
        icon="my-icons:warning"
        >Пожаловаться</r-text
      >
    </div>
  </div>
</template>
