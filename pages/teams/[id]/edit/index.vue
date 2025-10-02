<script setup lang="ts">
import type { TeamsApiResponse, Team } from '@/shared/types';
import { useAuth } from '~/entities/auth';
import * as z from 'zod';
import type { FormSubmitEvent } from '@nuxt/ui';

type Schema = z.output<typeof schema>;

const toast = useToast();
const route = useRoute();
const router = useRouter();

const guid = computed(() => route.params?.id);

const routes = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Сообщество', to: '/teams' },
  { label: 'Команда', to: `/teams/${guid.value}` },
  { label: 'Редактирование команды' },
]);

const schema = z.object({
  name: z.string(),
});

const state = reactive<Partial<Schema>>({
  name: undefined,
});

const { data, refresh } = await useFetch('/api/teams', {
  key: computed(() => `team-${guid.value}`),
  query: { guid: guid.value },
  transform: (response: TeamsApiResponse) => {
    const { teams, ...obj } = response?.items;

    return {
      ...obj,
      ...(teams?.at(0) || {}),
    } as Team;
  },
  default: () => ({}) as Team,
});

const active = computed({
  get() {
    return (route.query.tab as string) || 'main';
  },
  set(tab: string) {
    router.push({
      query: {
        ...route.query,
        tab: tab ?? undefined,
      },
    });
  },
});

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Success',
    description: 'The form has been submitted.',
    color: 'success',
  });
  console.log(event.data);
}
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb>
      <r-breadcrumb :options="routes" />
    </template>

    <template #title>Редактирование команды</template>

    <UForm
      :schema="schema"
      :state="state"
      class="space-y-6"
      @submit="onSubmit"
    >
      <div class="grid grid-cols-2 gap-4">
        <UFileUpload
          label="Добавить аватарку"
          class="min-h-50"
          dropzone
        />
        <UFileUpload
          label="Добавить обложку"
          class="min-h-50"
          dropzone
        />
      </div>

      <UFormField
        label="Название команды"
        name="name"
        :ui="{
          label: 'text-[#404040]',
        }"
      >
        <UInput
          class="w-full"
          color="secondary"
          variant="subtle"
          size="xl"
          v-model="state.name"
        />
      </UFormField>

      <UFormField
        label="Добавить ссылку на сообщество"
        :ui="{
          label: 'text-[#404040]',
        }"
      >
        <UInputTags
          class="w-full"
          color="secondary"
          variant="subtle"
          size="xl"
          delete-icon="i-lucide-trash"
        />
      </UFormField>

      <UFormField
        label="Участники"
        :ui="{
          label: 'text-[#404040]',
        }"
      >
        <UInputTags
          class="w-full"
          color="secondary"
          variant="subtle"
          size="xl"
          delete-icon="i-lucide-trash"
        />
      </UFormField>

      <RTipTapEditor />

      <div class="flex items-center gap-4">
        <UButton
          class="font-bold"
          color="info"
          block
          variant="outline"
          type="submit"
        >
          Отмена
        </UButton>

        <UButton
          class="font-bold"
          block
          color="info"
          type="submit"
        >
          Сохранить
        </UButton>
      </div>
    </UForm>
  </NuxtLayout>
</template>

<style lang="scss" scoped></style>
