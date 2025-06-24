<script setup lang="ts">
import { useAuth } from '@/entities/auth';
import { MENU_OPTIONS } from '../../consts';

const open = ref(false);

const { setUser } = useAuth();
const { user } = storeToRefs(useAuth());

const close = () => {
  open.value = false;
};

const logout = async () => {
  const { data } = await useFetch('/api/auth/logout', {
    method: 'POST',
  });

  if (!data.value?.ok) return;

  setUser(null);
  close();
};
</script>

<template>
  <UDropdownMenu
    v-model:open="open"
    :items="MENU_OPTIONS"
    :ui="{
      content: 'w-85 bg-[#0862E0] p-3 rounded-[10px]',
    }"
    :content="{
      align: 'end',
    }"
  >
    <template #content-top>
      <NuxtLink
        @click="close"
        to="/user"
      >
        <div class="flex mt-5 mb-5 dropdown-logo">
          <UAvatar
            class="cursor-pointer w-19 h-19"
            icon="i-lucide-image"
            size="3xl"
          />

          <div class="flex flex-col pl-5 mt-2 text-white">
            <div class="font-bold text-2xl">{{ user?.name }}</div>
            <div class="font-normal text-base">{{ user?.email }}</div>
          </div>
        </div>
      </NuxtLink>
    </template>

    <template #item-label="{ item }">
      <div class="p-1 font-bold text-xl text-white">
        <NuxtLink
          v-if="item.link"
          :to="item.link"
        >
          {{ item.label }}
        </NuxtLink>

        <span v-else>{{ item.label }}</span>
      </div>
    </template>

    <template #item-leading="{ item }">
      <u-icon
        class="icon"
        mode="svg"
        :style="{ fontSize: '28px' }"
        :name="`my-icons:${item.icon}`"
      />
    </template>

    <UAvatar
      class="cursor-pointer"
      icon="i-lucide-image"
      size="2xl"
    />

    <template #content-bottom>
      <UButton
        @click="logout"
        class="m-2 items-center bg-[#ffff] text-[#0862E0] text-lg font-bold rounded-[10px] justify-center hover:bg-white cursor-pointer focus-visible:outline-2"
      >
        Выйти
      </UButton>
    </template>
  </UDropdownMenu>
</template>

<style lang="scss" scoped>
.icon {
  :deep(path) {
    stroke: #ffff;
  }
}
</style>
