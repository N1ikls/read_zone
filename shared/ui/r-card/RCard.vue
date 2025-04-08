<script setup lang="ts">
const classes = computed(() => []);
</script>

<template>
  <div
    class="r-card"
    :class="classes"
  >
    <div><slot /></div>
  </div>
</template>

<style lang="scss" scoped>
.r-card {
  background-color: #ffffff;
  height: 100%;
  width: 100%;
  border-radius: 35px;
}
</style>
