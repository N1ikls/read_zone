<script setup lang="ts">
import type { SelectValue } from 'ant-design-vue/es/select';
import {
  BOOKS_TYPE,
  BOOKS_AGE,
  RELEASE_TYPE,
  STATUS,
  OTHER,
} from '../../consts';

const { queries = {} } = defineProps<{
  queries: Record<string, string | number | string[] | undefined>;
}>();

const setRouteQueries = useSetRouteQuery();

const { data: tag } = useFetch('/api/tag');
const { data: genres } = useFetch('/api/genres');

const onUpdateString = (key: string, value: SelectValue) => {
  setRouteQueries(
    resetPaginationQuery({
      [key]: value as string | string[],
    }),
  );
};

const onUpdateArray = (key: string, value: string[] | string) => {
  console.log(value);
  setRouteQueries(
    resetPaginationQuery({
      [key]: Array.isArray(value) ? value.join(',') : (value as string),
    }),
  );
};
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-column">
      <div class="sidebar__item">
        <label>Жанры</label>
        <a-select
          :maxTagCount="3"
          mode="multiple"
          :field-names="{ label: 'name', value: 'id' }"
          style="width: 100%"
          :value="splitQueryValue(queries?.genres)"
          :options="genres"
          @update:value="(value) => onUpdateArray('genres', value)"
          allowClear
        >
        </a-select>
      </div>

      <div class="sidebar__item">
        <label>Теги</label>
        <a-select
          :maxTagCount="3"
          mode="multiple"
          :field-names="{ label: 'name', value: 'id' }"
          style="width: 100%"
          :options="tag"
          :value="splitQueryValue(queries?.tags)"
          @update:value="(value) => onUpdateArray('tags', value)"
          allowClear
        >
        </a-select>
      </div>

      <div class="sidebar__item">
        <label>Количество глав</label>

        <div class="sidebar__item-input">
          <a-input
            placeholder="от"
            @update:value="(value) => onUpdateString('chaptersFrom', value)"
            :value="queries?.chaptersFrom"
          />
          <span />

          <a-input
            placeholder="до"
            @update:value="(value) => onUpdateString('chaptersTo', value)"
            :value="queries?.chaptersTo"
          />
        </div>
      </div>

      <div class="sidebar__item">
        <label>Год релиза</label>

        <div class="sidebar__item-input">
          <a-input
            placeholder="от"
            @update:value="(value) => onUpdateString('yearFrom', value)"
            :value="queries?.yearFrom"
          />
          <span />
          <a-input
            placeholder="до"
            @update:value="(value) => onUpdateString('yearTo', value)"
            :value="queries?.yearTo"
          />
        </div>
      </div>

      <div class="sidebar__item">
        <label>Количество оценок</label>

        <div class="sidebar__item-input">
          <a-input
            placeholder="от"
            @update:value="(value) => onUpdateString('rateFrom', value)"
            :value="queries?.rateFrom"
          />
          <span />
          <a-input
            placeholder="до"
            @update:value="(value) => onUpdateString('rateTo', value)"
            :value="queries?.rateTo"
          />
        </div>
      </div>

      <div class="sidebar__item">
        <label>Возрастной рейтинг</label>
        <a-checkbox-group
          class="sidebar__item-checkbox"
          :value="splitQueryValue(queries?.ageRate)"
          name="checkboxgroup"
          :options="BOOKS_AGE"
          @change="(value) => onUpdateArray('ageRate', value)"
        />
      </div>

      <div class="sidebar__item">
        <label>Тип</label>
        <a-checkbox-group
          class="sidebar__item-checkbox"
          name="checkboxgroup"
          :value="splitQueryValue(queries?.types)"
          :options="BOOKS_TYPE"
          @change="(value) => onUpdateArray('types', value)"
        />
      </div>

      <div class="sidebar__item">
        <label>Формат выпуска</label>
        <a-checkbox-group
          class="sidebar__item-checkbox"
          name="checkboxgroup"
          :value="splitQueryValue(queries?.release_type)"
          :options="RELEASE_TYPE"
          @change="(value) => onUpdateArray('release_type', value)"
        />
      </div>

      <div class="sidebar__item">
        <label>Статус перевода</label>
        <a-checkbox-group
          :value="splitQueryValue(queries?.status)"
          class="sidebar__item-checkbox"
          name="checkboxgroup"
          :options="STATUS"
          @change="(value) => onUpdateArray('status', value)"
        />
      </div>

      <div class="sidebar__item">
        <label>Другое</label>
        <a-checkbox-group
          class="sidebar__item-other sidebar__item-checkbox"
          name="checkboxgroup"
          :options="OTHER"
        />
      </div>
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
  &::-webkit-scrollbar {
    width: 4px;
    height: 5px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 6px;
    background-color: #e1e6e6;
  }

  &-column {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  &__item {
    display: flex;
    flex-direction: column;

    &-input {
      display: flex;
      align-items: center;
      justify-content: space-between;

      span {
        margin: 0 8px;
        width: 35px;
        border-top: 2px solid #d9d9d9;
      }
    }

    &-checkbox {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      :deep(.ant-checkbox-inner) {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 25px;
        height: 25px;
      }

      :deep(.ant-checkbox-inner::after) {
        transform: rotate(45deg) scale(1.5) translate(-25%, -50%);
      }
    }

    &-other {
      grid-template-columns: 1fr;
    }
    label {
      padding: 12px 0;
    }
  }
}
</style>
