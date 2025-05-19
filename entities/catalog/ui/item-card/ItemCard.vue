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

      {{ item?.name }}

      <template #text>
        <a-tag
          v-for="(tag, tagIndex) in item.tags?.slice(0, 3)"
          :key="tagIndex"
          class="text-tag"
          color="#FFFFFF"
        >
          {{ tag }}
        </a-tag>
        <a-tag
          v-if="item.rating"
          class="text-tag"
          color="#FFFFFF"
        >
          {{ item.rating.toFixed(2) }}
        </a-tag>
      </template>

      <template #content> dsdasdddasad </template>

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
.item-card {
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 10px;
  margin-bottom: 16px;

  .avatar {
    width: 140px;
    height: 140px;
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
    font-weight: 600;
  }
}
</style>
