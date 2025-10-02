<script setup lang="ts">
const open = ref<boolean>(false);

const value = ref();
</script>

<template>
  <u-modal
    v-model:open="open"
    :ui="{
      content:
        'grid gap-2 rounded-[15px] p-6 ms:w-full  sm:max-w-lg  divide-y-0 overflow-y-auto ',
    }"
  >
    <u-button
      class="rounded-[10px]"
      color="info"
      size="lg"
    >
      Создать команду
    </u-button>

    <template #content>
      <div class="grid gap-6">
        <span class="font-bold text-[22px]">Создать команду</span>

        <div class="grid gap-4">
          <u-select-menu
            color="info"
            v-model="value"
            placeholder="Род деятельности"
            :items="[]"
          />

          <div class="flex flex-col gap-1">
            <label class="font-semibold text-[14px] text-[#404040]">
              Название
            </label>
            <u-input
              color="secondary"
              variant="subtle"
              placeholder="Readzone team"
            />
          </div>

          <div class="flex flex-col gap-1">
            <label class="font-semibold text-[14px] text-[#404040]"
              >Ссылка на группу или сообщество</label
            >
            <u-input
              color="secondary"
              variant="subtle"
              placeholder="Vk.com/readzoneteam"
            />
          </div>
        </div>

        <div class="grid gap-5">
          <UCheckbox
            :ui="{
              root: 'items-center',
            }"
          >
            <template #label>
              <p class="text-[12px] text-[#7B7B7B]">
                Нажимая на галочку, вы подтверждаете, что согласны с
                <span class="text-[#0862E0]">правилами сайта</span>
              </p>
            </template>
          </UCheckbox>

          <u-button
            block
            color="info"
            class="rounded-[10px] font-bold"
            size="xl"
          >
            Создать команду
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
