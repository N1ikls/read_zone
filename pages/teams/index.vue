<script setup lang="ts">
const route = useRoute();

const name = ref('');

const ROUTES = [
  { label: 'Главная', to: '/' },
  { label: 'Сообщество', to: '/catalog' },
  { label: 'Команды' },
];
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb>
      <r-breadcrumb :options="ROUTES" />
    </template>

    <template #title> Команды </template>

    <div class="flex gap-4 items-center mb-4">
      <UInput
        v-model="name"
        icon="i-lucide-search"
        size="md"
        :ui="{
          root: 'w-full mt-1',
          base: 'bg-[#F5F5F5] rounded-[10px]  h-9 placeholder:text-[#C2C2C2] placeholder:italic placeholder-text-base',
          trailing: 'pe-1',
        }"
        variant="soft"
        placeholder="Найти по названию команды"
      >
        <template
          v-if="name"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-circle-x"
            aria-label="Clear input"
            @click="name = ''"
          />
        </template>
      </UInput>

      <u-button
        color="secondary"
        class="rounded-[10px] flex items-center justify-center h-[37px] w-[40.52px]"
      >
        <u-icon
          mode="svg"
          name="my-icons:sorter-low"
        />
      </u-button>

      <u-button
        color="secondary"
        class="rounded-[10px] flex items-center justify-center h-[37px] w-[40.52px]"
      >
        <u-icon
          mode="svg"
          name="my-icons:sorter-up"
        />
      </u-button>
    </div>

    <div class="flex gap-4">
      <div class="sidebar w-[250px]">
        <div class="text-[14px] mb-4">По формату работ</div>

        <u-button block> Манхва </u-button>
      </div>

      <div class="flex flex-col flex-1 gap-4">
        <div
          v-for="i in 5"
          :key="i"
          class="list grid grid-cols-[1fr_180px] gap-2"
        >
          <div class="bg-[var(--bg-card)] rounded-[10px] p-4">
            <r-thing>
              <template #avatar>
                <img
                  style="height: 210px; width: 160px"
                  class="select-none size-full object-cover transition-all duration-200"
                  src="../../public/test_banner_2.png"
                />
              </template>

              <span class="item-card__title"> Название команды</span>

              <template #text>
                <span class="text-[15px]"> Участники: Аноним</span>
              </template>

              <template #content>
                <div
                  class="light:bg-[#FFFFFF] px-[6px] py-[8px] rounded-[10px] flex gap-1 items-center"
                >
                  <icon
                    name="my-icons:people"
                    class="text-[20px]"
                    mode="svg"
                  />

                  <span class="text-[12px]">2,5 тыс </span>
                </div>

                <div
                  class="light:bg-[#FFFFFF] px-[6px] py-[8px] rounded-[10px] flex gap-1 items-center"
                >
                  <icon
                    name="my-icons:like"
                    class="text-[20px]"
                    mode="svg"
                  />

                  <span class="text-[12px]">2,2 млн</span>
                </div>

                <div
                  class="light:bg-[#FFFFFF] px-[6px] py-[8px] rounded-[10px] flex gap-1 items-center"
                >
                  <icon
                    name="my-icons:read-board"
                    class="text-[20px] stroke-[1.5px]"
                    mode="svg"
                  />

                  <span class="text-[12px]">270 работ</span>
                </div>

                <div
                  class="p-[6px] bg-white/30 backdrop-blur-fallback rounded-[10px]"
                >
                  <span class="ellipsis">
                    Описание команды – это описание команды, а рыбный текст -
                    это текст, выполняющий исключительно утилитарную функцию. Он
                    не вписывается в контекст сайта, на котором используется, и
                    нужен только для заполнения пространства. Зачастую такой
                    текст даже не имеет четкого смысла и представляет собой
                    набор слов и фраз, которые вроде бы формируют грамматически
                    верные конструкции, но какой-либо мысли в них не
                    прослеживается.
                  </span>
                </div>
              </template>
            </r-thing>
          </div>

          <div
            class="bg-[#222222] rounded-[10px] flex items-center justify-center h-full w-full"
          >
            <img
              class="z-10 object-cover w-[150px]"
              src="../../public/teams-flag.png"
            />
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
:deep(.r-thing-header-wrapper) {
  justify-content: inherit;
}
:deep(.r-thing__header-content) {
  margin-top: 6px;
}

.backdrop-blur-fallback {
  backdrop-filter: blur(4.7px);
  -webkit-backdrop-filter: blur(4.7px);
}

.ellipsis {
  font-size: 12px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 6;
  word-break: break-all;
  overflow-wrap: break-word;
}
</style>
