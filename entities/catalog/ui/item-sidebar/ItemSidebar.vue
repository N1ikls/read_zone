<script setup lang="ts">
defineProps<{
  filter: object;
  genres: object[];
  tags: object[];
}>()

const bookTypes = getBookTypes()
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-sticky">dsadas dsa</div>
    <div>{{ filter }}</div>
    <div>
      <div>Жанры</div>
      <span v-for="genre in genres">{{ genre.name }}</span>
    </div>
    <div>
      <div>Тэги</div>
      <span v-for="tag in tags">{{ tag.name }}</span>
    </div>
    <div>
      <div v-for="(bookTypeName, bookType) in bookTypes"><input type="checkbox" value=""{{ bookTypeName }}</div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sidebar {
  position: sticky;
  top: calc(var(--header-height) + 30px);
  align-self: flex-start;
  width: 320px;
  height: 800px;
  overflow: auto;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
}
</style>
