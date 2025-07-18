<script setup lang="ts">
import { RThing } from '@/components';
import type { Book } from '~/shared/types';

const { item } = defineProps<{
  item: Book;
}>();
</script>
<template>
  <r-thing>
    <template #avatar>
      <img :src="item.background" />
    </template>

    {{ item?.name }}

    <template
      v-if="item.genres"
      #content
    >
      <span
        v-for="(genre, index) in item.genres"
        class="tag"
        :key="index"
      >
        {{ genre.name }}
      </span>
    </template>

    <template
      v-if="item.rate"
      #extra
    >
      <div class="extra">
        <span>
          <u-icon
            mode="svg"
            name="my-icons:rate"
          />
        </span>

        <span>{{ item.rate.toFixed(1) }}</span>
      </div>
    </template>

    <template
      v-if="item.description"
      #description
    >
      {{ item.description }}
    </template>

    <template
      v-if="item.actions"
      #actions
    >
      {{ item.actions }}
    </template>
  </r-thing>
</template>

<style lang="scss" scoped>
.tag {
  background-color: #97bfff;
  padding: 4px;
  border-radius: 4px;
  font-size: 12px;
}

.extra {
  display: flex;
  gap: 3px;

  &:deep(path) {
    fill: #0862e0;
  }
}
</style>
