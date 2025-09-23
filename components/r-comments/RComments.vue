<script setup lang="ts">
import { ItemComment } from './ui';
import type { TeamComment } from '~/shared/types';

const { items = [], count = 0 } = defineProps<{
  items: TeamComment[];
  count: number;
}>();

const emits = defineEmits<{
  create: [v: string];
  like: [v: string, e: boolean];
  reply: [id: string, v: string];
}>();

const content = ref('');

const onReply = (id: string, value: string) => {
  emits('reply', id, value);
};

const onCreate = () => {
  emits('create', content.value);
  content.value = '';
};

const onLike = (id: string, isLike: boolean) => {
  emits('like', id, isLike);
};

const groupedComments = computed(() => {
  const parents = items.filter((comment) => comment.parent_id === null);

  return parents.map((parent) => ({
    ...parent,
    replies: items
      .filter((reply) => reply.parent_id === parent.id)
      .map((reply) => ({
        ...reply,
        parent_name: parent.user_name,
      })),
  }));
});
</script>

<template>
  <div
    class="r-comments border border-[#404040] rounded-[10px] p-5 w-full mt-[45px]"
  >
    <div class="text-[16px] mb-4">Комментарии {{ count || '' }}</div>

    <div class="comment-form">
      <UTextarea
        v-model="content"
        color="info"
        class="w-full text-[#999999]"
        placeholder="Понравилась глава? Есть замечания? Напишите об этом!"
      >
        <template #trailing>
          <u-button
            color="info"
            variant="ghost"
            size="xs"
            class="edit-btn w-6 h-6 p-0 flex items-center justify-center rounded-[6px] border border-[#97BFFF] bg-[#FFFFFF] hover:bg-[#F2F9FF]"
            @click.stop="onCreate"
          >
            <u-icon
              name="my-icons:edit-pencil"
              class="w-4 h-4"
            />
          </u-button>
        </template>
      </UTextarea>
    </div>

    <div class="r-comments__list mt-[40px] grid gap-4">
      <item-comment
        v-for="(comment, index) in groupedComments"
        :key="index"
        :comment="comment"
        @reply="onReply"
        @like="onLike"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.r-comments__list {
  & > :not(:last-child) {
    padding-bottom: 20px;
    border-bottom: 1px solid #c2c2c2;
  }
}
</style>
