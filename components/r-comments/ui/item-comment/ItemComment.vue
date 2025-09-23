<script setup lang="ts">
import { isEmpty } from 'es-toolkit/compat';
import numeral from 'numeral';
import { useFormatDate } from '~/shared/lib';
import type { TeamComment } from '~/shared/types';

const { comment } = defineProps<{
  comment: TeamComment;
}>();

const { smartFormat } = useFormatDate();

const reply = ref(false);
const content = ref('');

const createdAt = computed(() => smartFormat(comment.created_at));

const emit = defineEmits<{
  (e: 'reply', id: string, value: string): void;
  (e: 'like', id: string, isLike: boolean): void;
}>();

const handleReply = () => {
  reply.value = !reply.value;
};

const onReply = () => {
  handleReply();
  emit('reply', comment.id, content.value);
};

const onLike = () => {
  emit('like', comment.id, !comment.is_liked);
};
</script>

<template>
  <div class="comment w-full">
    <div class="comment__header flex gap-4">
      <u-avatar
        :alt="comment.user_name"
        class="size-12 mt-[12px]"
      />

      <div class="grid gap-1 flex-1">
        <div class="flex gap-1 items-center">
          <p class="text-[16px] font-bold">{{ comment.user_name }}</p>
          <p
            class="text-[#ADADAD] text-[12px] leading-[1.15]"
            v-if="!!comment?.parent_name"
          >
            В ответ {{ comment.parent_name }}
          </p>
        </div>
        <p class="text-[12px] leading-[1.15]">{{ comment.content }}</p>

        <div class="comment__actions flex gap-2 justify-between items-center">
          <div class="flex gap-2 items-center">
            <p class="text-[12px] text-[#7B7B7B] font-light">{{ createdAt }}</p>

            <p
              class="text-[12px] text-[#0048B8] cursor-pointer"
              @click="handleReply"
            >
              Ответить
            </p>
          </div>

          <div
            class="flex gap-1 items-center cursor-pointer"
            @click="onLike"
          >
            <icon
              mode="svg"
              class="text-[12px]"
              :class="{ 'like ': !!comment.likers_count }"
              name="i-lucide-heart"
            />

            <span class="text-[12px] leading-[1.15]">
              {{
                numeral(comment.likers_count).format('0.[0]a').toUpperCase()
              }}</span
            >
          </div>
        </div>

        <UTextarea
          v-if="reply"
          v-model="content"
          color="info"
          class="w-full text-[#999999]"
        >
          <template #trailing>
            <u-button
              color="info"
              variant="ghost"
              size="xs"
              class="edit-btn w-6 h-6 p-0 flex items-center justify-center rounded-[6px] border border-[#97BFFF] bg-[#FFFFFF] hover:bg-[#F2F9FF]"
              @click.stop="onReply"
            >
              <u-icon
                name="my-icons:edit-pencil"
                class="w-4 h-4"
              />
            </u-button>
          </template>
        </UTextarea>

        <div
          v-if="!isEmpty(comment?.replies)"
          class="grid gap-2"
        >
          <item-comment
            v-for="(item, index) in comment?.replies"
            :key="index"
            :comment="item"
            @reply="onReply"
            @like="onLike"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.like {
  :deep(path) {
    fill: var(--color-red-700);
    stroke: var(--color-red-700);
  }
}
</style>
