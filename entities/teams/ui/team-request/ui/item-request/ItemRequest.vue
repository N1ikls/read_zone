<script lang="ts" setup>
import { useVirtualList } from '@vueuse/core';
import { format, parseISO } from 'date-fns';
import type { Application } from '../../../../types';

const { items = [] } = defineProps<{
  items: Application[];
}>();

const emit = defineEmits<{
  refresh: [];
}>();
const route = useRoute();
const toast = useToast();

const normalized = computed(() =>
  items.filter((item) => item.status === 'pending'),
);

const { list, containerProps, wrapperProps } = useVirtualList(normalized, {
  itemHeight: 50,
  overscan: 10,
});

const guid = computed(() => route.params.id as string);

const { isGuids, guidsChecked, isAllChecked, toggleGuid, toggleAll } =
  useGuidsChecked(normalized);

const onSubmit = async (action: 'approve' | 'reject') => {
  try {
    await $fetch(`/api/teams/${guid.value}/applications/process`, {
      method: 'post',
      body: {
        action,
        application_ids: Array.from(guidsChecked.values()),
        admin_comment: 'Добро пожаловать в команду!',
      },
    });

    emit('refresh');
    toast.add({ title: 'Заявка одобрена' });
  } catch {
    toast.add({ title: 'Ошибка обработки' });
  }
};
</script>

<template>
  <template v-if="list.length">
    <div class="light:bg-[#F5F5F5] pb-4 rounded-[10px]">
      <div class="overflow-x-auto md:overflow-x-visible">
        <div class="min-w-[600px] md:min-w-0">
          <div
            class="grid gap-2 grid-cols-[4fr_1fr_32px_32px] h-[50px] px-4 items-center"
          >
            <div @click.stop="toggleAll">
              <u-checkbox
                label="Выбрать все"
                color="info"
                size="lg"
                :model-value="isAllChecked"
                :ui="{
                  base: 'ring-2 ring-[#0862E0]',
                }"
              />
            </div>
          </div>

          <div
            v-bind="containerProps"
            class="max-h-[450px] overflow-auto scrollbar px-4"
          >
            <div v-bind="wrapperProps">
              <template
                v-for="{ index, data } in list"
                :key="index"
              >
                <div class="grid gap-2 grid-cols-[4fr_1fr_32px_32px]">
                  <r-list-item
                    :key="index"
                    :guid="data.id"
                    :checked="guidsChecked.has(data.id)"
                    @checkbox-toggled="toggleGuid"
                    checked-allowed
                  >
                    <template #title>
                      <div class="flex items-center gap-2">
                        <UAvatar
                          :src="data.user_avatar || '/test_avatar.png'"
                          class="size-12"
                        />

                        <div class="flex flex-col gap-1">
                          <div class="flex items-center gap-2">
                            <p class="text-base cs-text leading-xs font-bold">
                              {{ data.user_name }}
                            </p>
                            <p class="text-[10px] text-[#999999] font-light">
                              Хочет присоединиться к команде
                            </p>
                          </div>
                          <p class="cs-text leading-xs text-xs font-normal">
                            {{
                              format(
                                parseISO(data.created_at as string),
                                'dd.MM.yyyy',
                              )
                            }}
                          </p>
                        </div>
                      </div>
                    </template>
                  </r-list-item>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <div
    v-else
    class="relative flex flex-col items-center justify-center gap-4 rounded-lg p-4 sm:p-6 lg:p-8 min-w-0 bg-default ring ring-default"
  >
    <div class="flex flex-col items-center gap-2 max-w-sm text-center">
      Пусто
    </div>
  </div>

  <div
    v-if="list.length"
    class="flex mt-[30px] items-center gap-2"
  >
    <u-button
      color="info"
      variant="outline"
      size="lg"
      block
      :disabled="!isGuids"
      @click="onSubmit('reject')"
    >
      Отклонить
    </u-button>

    <u-button
      class="font-bold"
      color="info"
      block
      size="lg"
      :disabled="!isGuids"
      @click="onSubmit('approve')"
    >
      Принять
    </u-button>
  </div>
</template>
