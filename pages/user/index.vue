<script setup lang="ts">
import { ItemSidebar } from '@/entities/user';
import { ROUTES, ACTIONS_BUTTONS, TABS } from './consts';
import { useAuth } from '~/entities/auth';
const route = useRoute();

const guid = computed(() => route.params.id as string);

const { user } = useAuth();
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb>
      <r-breadcrumb :options="ROUTES" />
    </template>

    <div class="absolute-background"></div>

    <div class="user">
      <div class="layout">
        <item-sidebar />

        <div class="user-content">
          <div class="user-content__header h-45 flex flex-col justify-between">
            <div class="user-content__header-title flex justify-between">
              <div class="user-content__header-title-info w-full">
                <div class="font-bold text-[#000000] text-[26px]">
                  {{ user?.name }}
                </div>
                <div class="font-normal text-[#999999] text-base">
                  {{ user?.email }}
                </div>
              </div>

              <div class="user-content__header-title-actions">
                <UButton
                  size="xl"
                  class="bg-[#FFFFFF] p-[6px] rounded-[10px] cursor-pointer"
                  variant="link"
                >
                  <template #trailing>
                    <UIcon
                      :style="{ fontSize: '30px' }"
                      name="my-icons:edit-pencil"
                    />
                  </template>
                </UButton>
              </div>
            </div>

            <div
              class="user-content__main text-[#1E1E1E] font-normal text-base"
            >
              Описание профиля, информация о себе или другой текст. Может быть в
              несколько строк.
            </div>

            <div class="user-content__footer flex align-center gap-[50px]">
              <r-text icon="my-icons:people-black"> 35 подписки </r-text>
              <r-text icon="my-icons:read"> 200 прочитано </r-text>
              <r-text icon="my-icons:like"> 100 понравилось</r-text>
              <r-text icon="my-icons:timer"> 2021 дата регистрации</r-text>
            </div>
          </div>

          <div class="user-content__main mb-12 mt-12">
            <div class="flex justify-between">
              <r-text icon="my-icons:chart-top">
                <span class="text-[#1E1E1E] font-normal text-[15px]">
                  В топе авторов на 50 месте
                </span>
              </r-text>

              <u-button
                icon="my-icons:info"
                class="text-[#3881F6] font-normal text-[15px] cursor-pointer hover:text-[none]"
                variant="link"
                size="lg"
              >
                Пользовательское соглашение
              </u-button>
            </div>

            <div class="p-5 mt-3 w-full h-70 bg-[#97BFFF] rounded-[10px]">
              <div class="text-center text-[#FFFFFF] font-bold text-xl">
                Коллекции
              </div>
            </div>
          </div>

          <div
            v-if="true"
            class="p-5 mt-3 w-full h-70 light:bg-[#F5F5F5] rounded-[10px]"
          >
            <div class="text-center font-bold text-xl">
              У профиля пока нет работ в мастерской
            </div>
          </div>

          <div
            v-else
            class="user-content__footer"
          >
            <div class="grid grid-cols-[132px_1.55fr_1fr] gap-2">
              <div class="flex flex-col gap-2">
                <img
                  class="w-full h-33 rounded-[15px] object-cover"
                  src="../../public/test.png"
                />
                <img
                  class="w-full h-33 rounded-[15px] object-cover"
                  src="../../public/test.png"
                />
                <img
                  class="w-full h-33 rounded-[15px] object-cover"
                  src="../../public/user-test.png"
                />
              </div>

              <img
                class="w-100 h-103 rounded-[15px] object-cover"
                src="../../public/user-test.png"
              />

              <div class="flex flex-col justify-between">
                <div class="bg-[#F5F5F5] rounded-[15px] p-8 w-full">
                  <div class="font-normal text-[15px]">Ваша мастерская:</div>

                  <div class="font-bold text-[32px]">456 подписчиков</div>
                </div>

                <u-button
                  v-for="action in ACTIONS_BUTTONS"
                  class="pl-5 gap-4 justify-start rounded-[15px] h-16 bg-[#F5F5F5] font-bold text-xl hover:bg-[none] cursor-pointer"
                  block
                  :class="action.class"
                >
                  <template #leading>
                    <UIcon
                      class="mt-1"
                      name="my-icons:arrow-left"
                    />
                  </template>

                  {{ action.name }}
                </u-button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center gap-8 w-full mt-10">
        <UTabs
          color="info"
          :items="TABS"
          class="w-full"
        >
          <template #posts>
            <div class="mt-6">
              <div class="font-bold text-[#050505] text-xl">Все посты: 12</div>
            </div>
          </template>
        </UTabs>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.layout {
  display: grid;
  grid-template-columns: minmax(200px, 285px) 3fr;
  gap: 20px;
}

.absolute-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 340px;
  background-color: #f5f5f5;
  z-index: -1;
}
</style>
