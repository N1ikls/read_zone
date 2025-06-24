<script setup lang="ts">
import { ROUTES } from './consts';
const route = useRoute();

const { data } = useFetch('/api/book', {
  method: 'get',
  query: {
    id: route.params.id,
  },
});
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb> <r-breadcrumb :options="ROUTES" /> </template>

    <div class="absolute-background"></div>

    <div
      v-if="data"
      class="book w-full"
    >
      <div class="layout">
        <div class="sidebar">
          <img
            class="book__avatar"
            src="../../public/test_book.jpg"
          />
        </div>

        <div
          class="book-content__header h-76 flex flex-col justify-between bg-[#FFFFFF]"
        >
          <div
            class="book-content__header-title flex items-start justify-between"
          >
            <div class="book-content__header-title-info w-full">
              <div
                class="font-bold text-[#000000] w-[80%] text-[32px] leading-[40px]"
              >
                {{ data.name }}
              </div>

              <div class="font-normal text-[#999999] text-base mt-4">
                {{ data.description }}
              </div>
            </div>

            <div class="book-content__header-title-actions pt-2">
              <div class="extra">
                <u-icon
                  mode="svg"
                  class="rate"
                  name="my-icons:rate"
                />

                <span class="font-bold text-[16px]"> {{ 4.85 }}</span>
              </div>
            </div>
          </div>

          <div class="book-content__footer flex align-center gap-[50px]">
            <r-text icon="my-icons:people-black"> 35 подписки </r-text>
            <r-text icon="my-icons:read"> 200 прочитано </r-text>
            <r-text icon="my-icons:like"> 100 понравилось</r-text>
            <r-text icon="my-icons:timer"> 2021 дата регистрации</r-text>
          </div>

          <div class="flex flex-col gap-2">
            <span class="font-normal text-[#999999] text-base">
              Альтернативные названия
            </span>
            <div class="flex items-center gap-3">
              <u-button
                class="bg-[#F5F5F5] text-[#000000] text-[12px] hover:bg-[#F5F5F5]"
                block
                >Название</u-button
              >
              <u-button
                class="bg-[#F5F5F5] text-[#000000] text-[12px] hover:bg-[#F5F5F5]"
                block
                >Название</u-button
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.absolute-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 544px;
  background: linear-gradient(to bottom right, #5294ff, #0e4aa9);
  z-index: -1;
}

.layout {
  display: grid;
  grid-template-columns: minmax(200px, 285px) 3fr;
  gap: 20px;
}

.book {
  &__avatar {
    width: 288px;
    height: 379px;
    object-fit: cover;
    border-radius: 15px;
  }

  &-content {
    &__header {
      padding: 20px;
      border-radius: 15px 15px 0 0px;
    }
  }
}

.extra {
  display: flex;
  align-items: center;
  gap: 3px;

  &:deep(path) {
    fill: #0862e0;
  }
}
</style>
