<script setup lang="ts">
const name = ref('');

const isFilters = ref(false);

const open = () => {
  isFilters.value = true;
};
</script>

<template>
  <div class="catalog__filters">
    <div class="catalog__filters-flex">
      <div class="grid">
        <a-input
          class="input"
          v-model:value="name"
          :bordered="false"
          placeholder="Найти по названию книги"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>

        <a-button class="button">
          <template #icon>
            <Icon name="my-icons:sorter-low" />
          </template>
        </a-button>

        <a-button class="button">
          <template #icon> <Icon name="my-icons:sorter-up" /> </template>
        </a-button>

        <a-button
          v-if="!isFilters"
          class="button-filter"
          type="primary"
          @click="open"
        >
          <Icon name="my-icons:filters" />
          <span class="button-filter__text">Фильтры</span>
        </a-button>
      </div>

      <slot />
    </div>

    <div
      v-if="isFilters"
      class="catalog__sidebar"
    >
      <div class="catalog__filters-sticky">
        <!-- Ваш контент фильтров -->
        dsa
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.grid {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 30px;
  // display: grid;
  // align-items: center;
  // gap: 12px;
  // grid-template-columns: 1fr 40px 40px 110px;
}

.catalog {
  &__sidebar {
    position: sticky;
    top: calc(var(--header-height) + 10px);
    align-self: flex-start;
    width: 320px;
    height: 800px;
    overflow: auto;
    border: 1px solid #e0e0e0;
    border-radius: 10px;
  }

  &__filters {
    display: flex;
    position: relative;
    gap: 16px;

    &-flex {
      flex: 1;
    }
  }

  .button {
    border-radius: 10px;
    min-width: 37px;
    height: 37px;
    background-color: #f5f5f5;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      font-size: 15px;
    }

    &-filter {
      display: flex;
      align-items: center;
      border-radius: 10px;
      height: 37px;

      &__text {
        margin-left: 6px;
      }
    }
  }

  .input {
    border-radius: 10px;
    background-color: #f5f5f5;
    min-height: 37px;
  }
}
</style>
