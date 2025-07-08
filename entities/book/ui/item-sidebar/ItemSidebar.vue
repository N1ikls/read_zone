<script lang="ts" setup>
import { STATUS } from '@/shared/consts';

import { BOOKMARKS } from '../../consts';

const { statuses, isWriteable } = defineProps<{
  statuses: string | undefined;
  isWriteable: boolean;
}>();

const route = useRoute();

const bookmark = ref<string | undefined>();
const status = ref<string | undefined>(statuses);

const { data } = await useFetch('/api/bookmarks/status', {
  method: 'get',
  query: {
    guid: route.params.id,
  },
});

const onUpdate = async (value: string) => {
  await $fetch('/api/bookmarks/save', {
    method: 'post',
    query: {
      guid: route.params.id,
      type: value,
    },
  });
};

const onUpdateStatus = async (value: string) => {
  await $fetch('/api/book/status', {
    method: 'post',
    query: {
      guid: route.params.id,
      status: value,
    },
  });
};

watch(
  data,
  (newValue) => {
    if (!newValue) return;
    bookmark.value = newValue?.type;
  },
  {
    immediate: true,
  },
);
</script>

<template>
  <div
    class="xs:max-w-[70vw] mx-auto flex w-full max-w-[60vw] shrink-0 basis-3/5 flex-col gap-4 sm:max-w-[320px] sm:basis-1/2 md:sticky md:top-[76px] md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
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
      class="fresnel-container fresnel-greaterThanOrEqual-md fresnel-«r15v» p-0l z-[100] w-full flex-col justify-between gap-2 flex"
    >
      <UButton
        class="p-2 h-10 rounded-[10px] font-bold text-lg cursor-pointer"
        color="info"
        block
      >
        Начать читать
      </UButton>

      <USelect
        color="info"
        variant="outline"
        v-model="bookmark"
        :items="BOOKMARKS"
        placeholder="Добавить в планы"
        :ui="{
          base: 'justify-center',
          placeholder: 'text-[#050505] font-bold',
        }"
        class="text-[#050505] ring-info ring-inset ring-2 p-2 h-10 rounded-[10px] font-bold text-lg cursor-pointer"
        @update:model-value="onUpdate"
      />

      <USelect
        v-if="isWriteable"
        color="info"
        variant="outline"
        v-model="status"
        :items="STATUS"
        placeholder="Обновить статус"
        :ui="{
          base: 'justify-center',
          placeholder: 'text-[#050505] font-bold',
        }"
        class="text-[#050505] ring-info ring-inset ring-2 p-2 h-10 rounded-[10px] font-bold text-lg cursor-pointer"
        @update:model-value="onUpdateStatus"
      />

      <r-text
        class="justify-center warning cursor-pointer"
        icon="my-icons:warning"
        >Пожаловаться</r-text
      >
    </div>
  </div>
</template>
