<script setup lang="ts">
const slots = useSlots();

const { clamp = '2' } = defineProps<{
  clamp?: string;
}>();
</script>

<template>
  <div class="r-thing">
    <div
      v-if="slots?.avatar"
      class="r-thing__avatar"
    >
      <slot name="avatar" />
    </div>

    <div class="r-thing-header-wrapper">
      <div class="r-thing__header">
        <div class="r-thing__header-title">
          <slot />

          <div
            v-if="slots?.extra"
            class="r-thing__header-extra"
          >
            <slot name="extra" />
          </div>
        </div>

        <div
          v-if="slots?.text"
          class="r-thing__header-text"
        >
          <slot name="text" />
        </div>
      </div>

      <div
        v-if="slots?.content"
        class="r-thing__header-content"
      >
        <slot name="content" />
      </div>

      <div
        v-if="slots?.description"
        class="r-thing__description ellipsis"
      >
        <slot name="description" />

        <div
          v-if="slots?.actions"
          class="r-thing__description-actions"
        >
          <slot name="actions" />
        </div>
      </div>
    </div>

    <div
      v-if="slots?.right"
      class="r-thing-right"
    >
      <div class="r-thing-right__wrapper">
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.r-thing {
  display: flex;
  flex-wrap: nowrap;
  color: #131313;
  line-height: 20px;

  &-right {
    margin-left: 12px;
    width: 120px;
    height: 132px;

    &__wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background-color: #97bfff;
      height: 100%;
    }
  }

  &-header {
    &-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    &-extra {
      font-size: 18px;
      font-weight: 600;
    }
  }

  &__header {
    display: flex;
    flex-direction: column;
    font-size: 20px;
    font-weight: 700;

    &-title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
    }

    &-text {
      display: flex;
      align-items: center;
      margin-top: 8px;
      font-size: 12px;
      color: #000000;
      font-weight: 400;
    }

    &-content {
      display: flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }
  }

  &__avatar {
    margin-right: 12px;
    margin-top: 2px;
    :deep(img) {
      width: 100px;
      height: 132px;
      border-radius: 5px;
      object-fit: cover;
    }
  }

  &__description {
    margin-top: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: v-bind(clamp);
    word-break: break-all;
    overflow-wrap: break-word;

    &-actions {
      font-size: 14px;
      font-weight: 500;
    }
  }
}
</style>
