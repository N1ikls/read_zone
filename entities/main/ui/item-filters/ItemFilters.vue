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

    <template #text> 2021 10 млн 200 глав 2000 </template>

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
      #right
    >
      <div class="rate">{{ item.rate }}</div>

      <a-rate
        class="stars"
        :value="5"
        disabled
      />

      <div class="grad">{{ item.grad }} оценки</div>
    </template>
  </r-thing>
</template>

<style lang="scss" scoped>
.tag {
  background-color: #97bfff;
  padding: 4px 6px;
  border-radius: 4px;
  font-size: 12px;
}

.stars {
  color: #0862e0;

  :deep(.ant-rate-star) {
    margin-inline-end: 0;
  }

  :deep(svg) {
    font-size: 15px;
  }
}

.grad {
  font-size: 14px;
  font-weight: 600;
  line-height: 12px;
  margin-top: 2px;
}
.rate {
  font-size: 36px;
  font-weight: 700;
  line-height: 36px;
  margin-bottom: 10px;
}
.extra {
  display: flex;
  gap: 3px;
}
</style>
