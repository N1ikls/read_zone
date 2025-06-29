<script setup lang="ts">
import { ROUTES, TABS } from './consts';
import { Status } from '@/entities/catalog';
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

    <div class="book w-full">
      <div class="layout">
        <div class="sidebar">
          <img
            class="book__avatar"
            src="../../public/test_book.jpg"
          />

          <div class="sidebar__buttons mb-[80px]">
            <UButton
              class="mb-[8px] p-2 h-10 rounded-[10px] font-bold text-lg cursor-pointer"
              color="info"
              block
            >
              Начать читать
            </UButton>

            <UButton
              class="mb-[8px] text-[#050505] p-2 h-10 rounded-[10px] font-bold text-lg cursor-pointer"
              color="info"
              variant="outline"
              block
            >
              Добавить в планы
            </UButton>

            <UButton
              class="mb-[20px] p-2 h-10 rounded-[10px] font-bold text-lg cursor-pointer"
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

          <div class="status text-[20px] font-bold mb-[30px]">
            Статус перевода: <span class="text-[#0862E0]">70 %</span>
          </div>

          <div class="text-[20px] font-bold mb-4">Категории</div>

          <div
            class="grid-tags gap-4 grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))]"
          >
            <div
              class="tag rounded-[10px] text-[16px] text-[#000000] bg-[#97BFFF] flex items-center justify-center p-2"
              v-for="item in data?.genres"
            >
              {{ item.name }}
            </div>
          </div>
        </div>

        <div class="book-content">
          <div
            class="book-content__header h-77 flex flex-col justify-between light:bg-[#fffff] light:shadow-[0_2px_8px_rgba(0,0,0,0.1)] mb-4"
          >
            <div
              class="book-content__header-title flex items-start justify-between"
            >
              <div class="book-content__header-title-info w-full">
                <div
                  v-if="data?.name"
                  class="font-bold text-[#000000] w-[80%] text-[32px] leading-[40px] ellipsis"
                >
                  {{ data.name }}
                </div>

                <div
                  v-if="data?.description"
                  class="font-normal text-[#999999] text-base mt-4 ellipsis"
                >
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

            <div class="book-content__footer flex align-center gap-[30px]">
              <r-text icon="my-icons:eyes-black">
                {{ data?.viewers_count }} просмотров
              </r-text>
              <r-text icon="my-icons:read">
                {{ data?.chapters_count }} глав</r-text
              >
              <r-text icon="my-icons:like-black">
                {{ data?.likers_count }} лайков
              </r-text>
              <r-text icon="my-icons:timer">
                {{ data?.year }} Год выхода</r-text
              >
              <r-text icon="my-icons:checked">
                {{ Status[data?.status as keyof typeof Status] }}
              </r-text>
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

          <div class="book-content__main flex items-center gap-4">
            <UTabs
              color="info"
              :items="TABS"
              class="w-full"
            >
              <template #info>
                <div class="light:bg-[#F5F5F5] rounded-[15px] p-5">
                  <div class="text-[#404040] text-[20px] mb-4">
                    Описание манги
                  </div>

                  <p
                    class="text-[16px] whitespace-pre-wrap"
                    v-if="data?.description"
                  >
                    {{ data.description }}
                  </p>

                  <div class="text-[#404040 text-[20px]">Создатели</div>
                </div>
              </template>
            </UTabs>

            <!-- <u-button
              v-for="(item, index) in BUTTONS"
              :class="item.class"
              class="bg-[#F5F5F5] text-[15px] h-13 w-50 items-center justify-center gap-3 rounded-[10px] hover:bg-[none] cursor-pointer"
              :key="index"
            >
              <template #leading>
                <UIcon
                  mode="svg"
                  :class="item.classIcon"
                  :name="item.icon"
                />
              </template>

              {{ item.name }}
            </u-button> -->
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
  background: #f5f5f5;
  z-index: -1;
}

.layout {
  display: grid;
  grid-template-columns: minmax(200px, 285px) 3fr;
  gap: 20px;
}

.warning {
  :deep(svg) {
    font-size: 16px;
  }
}

.book {
  &__avatar {
    width: 288px;
    height: 379px;
    object-fit: cover;
    border-radius: 10px;
    margin-bottom: 15px;
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

.ellipsis {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
</style>
