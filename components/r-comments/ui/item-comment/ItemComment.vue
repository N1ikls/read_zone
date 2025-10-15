<script setup lang="ts">
import { isEmpty } from 'es-toolkit/compat';
import numeral from 'numeral';
import { useFormatDate } from '~/shared/lib';
import type { TeamComment } from '~/shared/types';

import { ModalComplaint } from '../modal-complaint';
import type { FormReportType, FormReportTypeWithGuid } from '../../types';

const {
  comment,
  guid,
  isUser = true,
} = defineProps<{
  isUser: boolean;
  guid?: string;
  comment: TeamComment;
}>();

const { smartFormat } = useFormatDate();

const reply = ref(false);
const content = ref('');

const isEdit = computed(() => comment.created_by !== guid && isUser);
const createdAt = computed(() => smartFormat(comment.created_at));

const emit = defineEmits<{
  (e: 'reply', id: string, value: string): void;
  (e: 'like', id: string, isLike: boolean): void;
  (e: 'report', v: FormReportTypeWithGuid): void;
}>();

const handleReply = () => {
  reply.value = !reply.value;
  content.value = '';
};

const onReply = () => {
  emit('reply', comment.id, content.value);
  content.value = '';
  reply.value = false;
};

const onLike = () => {
  if (!isEdit.value) return;
  emit('like', comment.id, !comment.is_liked);
};

const onReport = (value: FormReportType) => {
  emit('report', { id: comment.id, ...value });
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
        <div class="flex gap-1 flex-1 items-center justify-between">
          <div class="flex gap-1 items-center flex-1">
            <p class="text-[16px] font-bold leading-7">
              {{ comment.user_name }}
            </p>

            <p
              class="text-[#ADADAD] text-[12px] leading-[1.15]"
              v-if="!!comment?.parent_name"
            >
              В ответ {{ comment.parent_name }}
            </p>
          </div>

          <ModalComplaint
            v-if="isEdit"
            @report="onReport"
          />
        </div>

        <p class="text-[12px] leading-[1.15]">{{ comment.content }}</p>

        <div class="comment__actions flex gap-2 justify-between items-center">
          <div class="flex gap-2 items-center">
            <p class="text-[12px] text-[#7B7B7B] font-light">{{ createdAt }}</p>

            <u-button
              v-if="isEdit"
              color="info"
              variant="link"
              class="text-[12px] text-[#0048B8] cursor-pointer p-0"
              @click="handleReply"
            >
              Ответить
            </u-button>
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
              {{ numeral(comment.likers_count).format('0.[0]a').toUpperCase() }}
            </span>
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
          class="grid gap-2 pt-1"
        >
          <item-comment
            v-for="(item, index) in comment?.replies"
            :key="index"
            :comment="item"
            :is-user="isUser"
            :guid="guid"
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
