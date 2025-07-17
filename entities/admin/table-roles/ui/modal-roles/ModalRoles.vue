<script setup lang="ts">
import { ACTIONS_ITEMS } from '../../consts';

defineProps<{
  title: string;
}>();
const open = ref<boolean>(false);

const model = defineModel({
  default: () => ({}),
});

const slots = useSlots();
</script>

<template>
  <u-modal
    v-model:open="open"
    :ui="{
      content:
        'grid gap-2 rounded-[10px] p-6 ms:w-full  sm:max-w-1xl  divide-y-0 overflow-y-auto ',
    }"
  >
    <u-button
      class="rounded-[10px] font-bold"
      color="info"
      icon="my-icons:pencil-outline"
      size="lg"
      variant="ghost"
    />

    <template #content>
      <div class="grid gap-6">
        <span class="font-bold text-[22px]">{{ title }}</span>

        <div class="grid gap-1">
          <label class="text-[15px]">Никнейм</label>
          <div
            class="light:bg-[#F5F5F5] rounded-[10px] flex items-center font-bold text-[20px] h-12 px-4"
          >
            MangaLover2007
          </div>
        </div>

        <div class="flex gap-4">
          <u-avatar
            alt="Manga Lover2007"
            class="size-22.5"
            :ui="{
              root: 'light:bg-[#0862E0]',
              fallback: 'text-[#FFFFFF] text-[32px]',
            }"
          />
          <div class="grid gap-2">
            <div class="grid">
              <label class="text-xs font-light">Почта</label>
              <div
                class="light:bg-[#F5F5F5] rounded-full flex items-center justify-center text-xs h-6 px-4"
              >
                MangaLover2007
              </div>
            </div>

            <div class="grid">
              <label class="text-xs font-light">Дата регистрации</label>

              <div class="flex items-center flex-wrap gap-2">
                <div
                  class="light:bg-[#F5F5F5] rounded-full flex items-center justify-center text-xs h-6 px-4"
                >
                  13.04.2024
                </div>
                <div
                  class="light:bg-[#F5F5F5] rounded-full flex items-center justify-center text-xs h-6 px-4"
                >
                  18:35:34
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="grid gap-4 grid-cols-1 xl:grid-cols-2">
          <div class="flex flex-col gap-1">
            <label class="text-[15px]">Роль</label>
            <u-select
              class="rounded-[10px] light:bg-[#F5F5F5] ring-0"
              :ui="{
                placeholder: 'text-highlighted font-semibold',
              }"
              color="secondary"
              size="xl"
              placeholder="Модератор"
              :items="[]"
            />
          </div>

          <div class="grid gap-1">
            <UCheckboxGroup :items="ACTIONS_ITEMS" />
          </div>
        </div>

        <div class="flex gap-2">
          <u-button
            block
            variant="outline"
            color="info"
            class="rounded-[10px] text-highlighted"
            size="xl"
          >
            Отмена
          </u-button>

          <u-button
            block
            color="info"
            class="rounded-[10px] font-bold"
            size="xl"
          >
            Подтвердить
          </u-button>
        </div>
      </div>
    </template>
  </u-modal>
</template>

<style lang="scss" scoped>
.shadow {
  box-shadow: 0px 0px 4px 0px #59595940;
}
</style>
