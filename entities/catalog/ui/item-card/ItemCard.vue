<script setup lang="ts">
import { Status } from '../../consts';

const { item = {} } = defineProps<{
  item: Record<string, string | number | string[]>;
}>();
</script>

<template>
  <div class="item-card">
    <r-thing>
      <template #avatar>
        <img
          class="avatar"
          src="../../../../public/catalog.jpg"
        />
      </template>

      <span class="item-card__title"> {{ item?.name }}</span>

      <template #text>
        <a-tag
          v-for="(tag, index) in item.genres"
          :key="index"
          class="text-tag"
          color="#FFFFFF"
        >
          {{ tag?.name }}
        </a-tag>

        <a-tag
          v-if="item.rate"
          class="text-tag"
          color="#FFFFFF"
        >
          <div class="extra">
            <icon name="my-icons:rate" />

            <span>{{ item.rate }}</span>
          </div>
        </a-tag>
      </template>

      <template #content>
        <div class="item-card__content">
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
        <a-tag
          class="tag"
          color="#1E9E1E"
        >
          {{ Status[item.status as keyof typeof Status] }}
        </a-tag>
      </template>
    </r-thing>
  </div>
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

.item-card {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-bottom: 16px;

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
    padding: 4px 11px;
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: #ffffff;
    border-radius: 10px;
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
