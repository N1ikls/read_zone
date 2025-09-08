<script setup lang="ts">
import type { Book } from '@/shared/types';
import { Status } from '../../consts';

const { item } = defineProps<{
  item: Book;
}>();
</script>

<template>
  <nuxt-link
    :to="`/book/${item.id}`"
    class="item-card"
  >
    <r-thing>
      <template #avatar>
        <img
          class="w-full object-cover"
          :src="item.background"
        />
      </template>

      <span class="item-card__title"> {{ item?.name }}</span>

      <template #text>
        <div class="flex gap-6">
          <div
            v-for="(genre, index) in item.genres"
            :key="index"
            class="tag bg-[#FFFFFF] rounded-[10px] text-[#000000] font-semibold text-sm"
          >
            {{ genre.name }}
          </div>

          <div
            v-if="item.rate"
            class="tag bg-[#FFFFFF] rounded-[10px] text-[#000000] font-semibold text-sm"
          >
            <div class="extra">
              <u-icon
                mode="svg"
                class="rate"
                name="my-icons:rate"
              />

              <span>{{ item.rate }}</span>
            </div>
          </div>
        </div>
      </template>

      <template #content>
        <div class="item-card__content mt-2">
          <div class="item-card__content-extra">
            <icon name="my-icons:timer" />

            <span>{{ item.year }}</span>
          </div>

          <div class="item-card__content-extra">
            <icon name="my-icons:eyes" />

            <span>{{ item.viewers_count }}</span>
          </div>

          <div class="item-card__content-extra">
            <icon name="my-icons:read" />

            <span>{{ item.chapters_count }}</span>
          </div>

          <div class="item-card__content-extra">
            <icon name="my-icons:like" />

            <span>{{ item.likers_count }}</span>
          </div>
        </div>
      </template>

      <template
        v-if="item.description"
        #description
      >
        <span class="description">
          {{ item.description }}
        </span>
      </template>

      <template
        v-if="item.status"
        #extra
      >
        <div
          class="tag bg-[#1E9E1E] rounded-[10px] type w-30 text-center p-5 pt-[6px] pb-[6px] text-[#FFFFFF] rounded-[6px] font-normal text-sm"
        >
          {{ Status[item.status as keyof typeof Status] }}
        </div>
      </template>
    </r-thing>
  </nuxt-link>
</template>

<style lang="scss" scoped>
.extra {
  display: flex;
  align-items: center;
  gap: 3px;

  :deep(.iconify) {
    font-size: 18px;
  }
}

.rate {
  :deep(path) {
    fill: #ffbc05;
  }
}

.item-card {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  cursor: pointer;
  transition: box-shadow 0.3s ease;
  &:hover {
    box-shadow: 0 0px 12px rgba(0, 0, 0, 0.1);
  }

  &__title {
    font-size: 26px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    word-break: break-all;
    overflow-wrap: break-word;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 8px;

    &-extra {
      display: flex;
      align-items: center;
      gap: 4px;
    }
  }

  .avatar {
    width: 153px;
    height: 153px;
    border-radius: 10px;
    object-fit: cover;
  }

  .tag {
    padding: 6px 10px;
  }
  .description {
    color: #000000;
    font-size: 12px;
    font-weight: 300;
    vertical-align: middle;
  }

  .text-tag {
    padding: 3px 10px;
    border-radius: 10px;
    margin-right: 4px;
    color: #000000;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
