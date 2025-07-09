<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import type { Chapter } from '~/shared/types';

import z from 'zod/v3';

const emits = defineEmits<{
  (e: 'positive', v: z.output<typeof schema>): void;
  (e: 'negative', v: boolean): void;
}>();

const open = ref<boolean>(false);

const model = ref<Partial<Chapter>>({});

const schema = z.object({
  name: z.string().min(10),
  volume: z.string().optional(),
  status: z.string().optional(),
  price: z.number().optional(),
});

const onSubmit = async (event: FormSubmitEvent<z.output<typeof schema>>) => {
  emits('positive', event.data);
  open.value = false;
};

const onNegative = () => {
  open.value = false;
  emits('negative', false);
};
</script>

<template>
  <u-modal
    v-model:open="open"
    :ui="{
      content:
        'grid gap-4 rounded-[10px] divide-y-0 p-7  max-sm:max-w-[calc(100vw-8px)] sm:max-w-2xl max-h-[559px]',
    }"
  >
    <u-button
      color="info"
      class="text-sm font-bold rounded-[10px]"
      size="lg"
    >
      Добавить главу
    </u-button>

    <template #content>
      <div class="flex flex-wrap items-center justify-between">
        <span class="font-bold text-[22px]"> Добавить главу </span>
      </div>

      <u-form
        class="space-y-4"
        :schema="schema"
        :state="model"
        @submit="onSubmit"
      >
        <div class="grid gap-4 grid-cols-2">
          <UFormField
            class="col-span-full"
            label="Название"
            name="name"
            :ui="{
              label: 'text-[#000000] font-bold text-md',
              error:
                'text-red-500 text-sm mt-0 transition-all duration-300 ease-in-out',
            }"
          >
            <u-input
              color="info"
              class="w-full rounded-[10px] transition-all duration-300"
              v-model="model.name"
            />
          </UFormField>

          <UFormField
            class="col-span-full"
            label="Том/арка"
            name="tom"
            :ui="{
              label: 'text-[#000000] font-bold text-md',
              error:
                'text-red-500 text-sm mt-0 transition-all duration-300 ease-in-out',
            }"
          >
            <u-input
              color="info"
              class="w-full rounded-[10px] transition-all duration-300"
              v-model="model.volume"
            />
          </UFormField>

          <UFormField
            label="Статус"
            name="status"
            :ui="{
              label: 'text-[#000000] font-bold text-md',
              error:
                'text-red-500 text-sm mt-0 transition-all duration-300 ease-in-out',
            }"
          >
            <u-input
              color="info"
              class="w-full rounded-[10px] transition-all duration-300"
              v-model="model.status"
            />
          </UFormField>

          <UFormField
            label="Стоимость главы"
            name="sum"
            :ui="{
              label: 'text-[#000000] font-bold text-md',
              error:
                'text-red-500 text-sm mt-0 transition-all duration-300 ease-in-out',
            }"
          >
            <u-input-number
              color="info"
              class="w-full rounded-[10px] transition-all duration-300"
              v-model="model.price"
            />
          </UFormField>
        </div>

        <div class="flex justify-between gap-2">
          <div class="grid gap-2">
            <u-checkbox
              label="Отложенная публикация"
              color="info"
              size="lg"
              :model-value="false"
              :ui="{
                wrapper: ' flex items-center h-full',
                label: 'text-xs',
                base: 'ring-2 rounded-[2px] ring-[#0862E0]',
              }"
            />
            <u-checkbox
              label="На подписку"
              color="info"
              size="lg"
              :model-value="false"
              :ui="{
                wrapper: ' flex items-center h-full',
                label: 'text-xs',
                base: 'ring-2 rounded-[2px] ring-[#0862E0]',
              }"
            />
          </div>
          <div class="flex gap-2 items-center">
            <u-button
              variant="outline"
              class="font-bold"
              color="info"
              @click="onNegative"
            >
              Закрыть
            </u-button>

            <u-button
              type="submit"
              class="font-bold"
              color="info"
            >
              Принять
            </u-button>
          </div>
        </div>
      </u-form>
    </template>
  </u-modal>
</template>

<style lang="scss" scoped>
.shadow {
  box-shadow: 0px 0px 4px 0px #59595940;
}
</style>
