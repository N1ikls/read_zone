<script setup lang="ts">
const slots = useSlots();
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
      <div
        v-if="slots?.default"
        class="r-thing__header"
      >
        <div class="r-thing__header-title"><slot /></div>

        <div
          v-if="slots?.extra"
          class="r-thing__header-extra"
        >
          <slot name="extra" />
        </div>
      </div>

      <div
        v-if="slots?.description"
        class="r-thing__description"
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
  </div>
</template>

<style lang="scss" scoped>
.r-thing {
  display: flex;
  flex-wrap: nowrap;
  color: #131313;
  line-height: 20px;

  &-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    &-wrapper {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
    }

    &-extra {
      font-size: 18px;
      font-weight: 600;
    }
  }

  &__header {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    font-size: 20px;
    font-weight: 700;
  }

  &__avatar {
    margin-right: 12px;
    margin-top: 2px;
  }

  &__description {
    display: flex;
    align-items: center;
    justify-content: space-between;

    font-size: 12px;

    &-actions {
      font-size: 14px;
      font-weight: 500;
    }
  }
}
</style>
