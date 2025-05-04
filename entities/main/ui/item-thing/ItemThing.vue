<script setup lang="ts">
import { RThing } from '@/components';

const { item = {} } = defineProps<{
  item: object;
}>();
</script>
<template>
  <r-thing>
    <template #avatar>
      <img src="../../../../public/test.png" />
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
        <span> <icon name="my-icons:star" /> </span>

        <span>{{ item.rate }}</span>
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
}
</style>
