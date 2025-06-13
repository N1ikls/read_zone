<script lang="ts" setup>
import { useAuth } from '@/entities/auth';

const { user } = useAuth();
</script>

<template>
  <div class="user-sidebar">
    <img class="user-sidebar__logo" />

    <div class="user-sidebar__buttons">
      <UButton
        class="mb-[10px] rounded-[10px] bg-[#f5f5f5] text-[#97BFFF] hover:bg-[#f5f5f5] font-bold text-lg cursor-pointer"
        color="secondary"
        size="xl"
        block
      >
        Мои работы
      </UButton>

      <UButton
        class="mb-[10px] rounded-[10px] bg-[#f5f5f5] text-[#97BFFF] hover:bg-[#f5f5f5] font-bold text-lg cursor-pointer"
        color="secondary"
        size="xl"
        block
      >
        Мои доходы
      </UButton>

      <UButton
        class="mb-[10px] rounded-[10px] bg-[#f5f5f5] text-[#97BFFF] hover:bg-[#f5f5f5] font-bold text-lg cursor-pointer"
        color="secondary"
        size="xl"
        block
      >
        Закладки
      </UButton>
    </div>

    <div class="user-sidebar__friends bg-[#97BFFF] rounded-[10px] w-full">
      <div class="p-4">
        <div class="font-bold text-xl text-center text-[#FFFFFF] mb-[10px]">
          Друзья ({{ 87 }})
        </div>

        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="i in 8"
            class="flex flex-col"
          >
            <div class="w-14 h-14 bg-[#D6D6D6] rounded-[10px]"></div>
            <div
              class="font-normal text-sm text-[#FFFFFF] text-center overflow-hidden text-ellipsis"
            >
              Имя {{ i }}
            </div>
          </div>
        </div>

        <UButton
          class="mt-[10px] bg-[none] text-[#ffff] hover:bg-[none] rounded-[10px] border font-bold text-lg cursor-pointer"
          color="secondary"
          block
        >
          Больше
        </UButton>
      </div>
    </div>

    <div class="user-sidebar__links w-full">
      <div class="user-sidebar__link">
        <Icon
          :style="{ fontSize: '23px' }"
          name="my-icons:discord"
        />
        discord.com
      </div>
      <div class="user-sidebar__link">
        <Icon
          :style="{ fontSize: '23px' }"
          name="my-icons:telegram-outline"
        />
        telegram.org
      </div>
      <div class="user-sidebar__link">
        <Icon
          :style="{ fontSize: '23px' }"
          name="my-icons:twitch"
        />
        twitch.tv
      </div>
      <div class="user-sidebar__link">
        <Icon
          :style="{ fontSize: '23px' }"
          name="my-icons:vk"
        />
        vk.com
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.user-sidebar {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 25px;

  img {
    border: none;
    height: 200px;
    width: 100%;
    background-color: #d6d6d6;
    border-radius: 10px;
  }

  &__link {
    display: grid;
    align-items: center;
    grid-template-columns: 30px 1fr;
    gap: 8px;
    margin-bottom: 16px;
    font-weight: 400;
    font-size: 14px;
    color: #1e1e1e;
  }
}
</style>
