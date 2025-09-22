<script lang="ts" setup>
import { ItemCard } from '@/entities/catalog';
import type { Team } from '@/shared/types';

const { item } = defineProps<{
  item: Team;
}>();

const emits = defineEmits<{
  refresh: [];
}>();

const route = useRoute();

const guid = computed(() => route.params?.id);

const onCreateComment = async (value: string) => {
  await $fetch(`/api/teams/${guid.value}/comments/create`, {
    method: 'post',
    body: {
      content: value,
    },
  });

  emits('refresh');
};

const onReply = async (id: string, value: string) => {
  await $fetch(`/api/teams/${guid.value}/comments/create`, {
    method: 'post',
    body: {
      parent_id: id,
      content: value,
    },
  });

  emits('refresh');
};

const onLike = async (id: string, positive: boolean) => {
  await $fetch(`/api/teams/${guid.value}/comments/${id}/like`, {
    method: 'post',
    body: {
      positive,
    },
  });

  emits('refresh');
};
</script>

<template>
  <div
    class="team-info grid w-full max-w-full min-w-0 flex-[1] grid-cols-[1fr_27%] gap-5"
  >
    <div class="team-info__content">
      <div class="p-5 border-1 rounded-[10px] border-[#C2C2C2] mb-4">
        <div class="text-[20px] font-bold mb-4">Описание команды</div>
        <p class="line-clamp-4 text-[#404040] text-[12px]">
          {{ item?.description }}
        </p>
      </div>

      <div class="px-4 text-[20px] font-bold mb-4">Топ работы команды</div>

      <div class="team-info__content-cards flex flex-col gap-4">
        <ItemCard
          v-for="book in item?.books || []"
          :key="book.id"
          :item="book"
        />
      </div>
    </div>

    <div class="team-info__sidebar">
      <div class="border-1 border-[#C2C2C2] rounded-[10px] p-2.5 mb-5">
        <p class="text-[20px] mb-3">Участники {{ item?.teammates_count }}</p>

        <div class="px-2">
          <div
            v-for="teammate in item?.teammates || []"
            :key="teammate.id"
            class="flex items-center gap-2"
          >
            <UAvatar
              :src="teammate.avatar || '/test_avatar.png'"
              class="size-12"
            />

            <div class="flex flex-col gap-0.5">
              <p class="text-[14px]">{{ teammate.name }}</p>
              <p class="text-[12px] text-[#0048B8]">
                {{ teammate.team_role || 'Участник' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="grid gap-3">
        <div
          class="bg-[#F5F5F5] px-3 py-4 rounded-[10px] flex gap-1 items-center text-[14px]"
        >
          <NuxtImg
            height="24"
            width="24"
            src="/svg/vk_rgb.svg"
          />

          vk.com/teamsrc
        </div>

        <div
          class="bg-[#F5F5F5] px-3 py-4 rounded-[10px] flex gap-1 items-center text-[14px]"
        >
          <NuxtImg
            height="24"
            width="24"
            src="/svg/discord_rbg.svg"
          />

          discord.com/blablalb
        </div>
      </div>
    </div>
  </div>

  <div class="teams-comments">
    <r-comments
      :items="item.comments"
      :count="item.comments_count"
      @create="onCreateComment"
      @like="onLike"
      @reply="onReply"
    />
  </div>
</template>
