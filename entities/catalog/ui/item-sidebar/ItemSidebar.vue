<script setup lang="ts">
import type { SelectValue } from 'ant-design-vue/es/select';
import {
  BOOKS_TYPE,
  BOOKS_AGE,
  RELEASE_TYPE,
  STATUS,
  OTHER,
} from '../../consts';
import { useCatalogState } from '../../models';

const { queries = {} } = defineProps<{
  queries: Record<string, string | number | string[] | undefined>;
}>();

const setRouteQueries = useSetRouteQuery();

const catalogState = useCatalogState();

const { showSidebar } = catalogState;

const { data: tag } = useFetch('/api/tag');
const { data: genres } = useFetch('/api/genres');

const tagsValue = ref(splitQueryValue(queries?.tags));
const genresValue = ref(splitQueryValue(queries?.genres));

const onUpdateString = (key: string, value: SelectValue) => {
  setRouteQueries(
    resetPaginationQuery({
      [key]: value as string | string[],
    }),
  );
};

const onUpdateArray = (key: string, value: string[] | string) => {
  setRouteQueries(
    resetPaginationQuery({
      [key]: Array.isArray(value) ? value.join(',') : (value as string),
    }),
  );
};
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-close">
      <u-button
        @click="showSidebar"
        class="button"
      >
        <Icon name="my-icons:close" />
      </u-button>
    </div>

    <div class="sidebar-wrapper">
      <div class="sidebar-column">
        <div class="sidebar__item">
          <label>Жанры</label>
          <u-select-menu
            multiple
            labelKey="name"
            valueKey="id"
            v-model="genresValue"
            :items="genres"
            @update:model-value="(value) => onUpdateArray('genres', value)"
          >
            <template
              v-if="genresValue.length"
              #trailing
            >
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-circle-x"
                aria-label="Clear input"
                @click.stop="
                  onUpdateArray('genres', '');
                  genresValue = [];
                "
              />
            </template>
          </u-select-menu>
        </div>

        <div class="sidebar__item">
          <label>Теги</label>
          <u-select-menu
            multiple
            labelKey="name"
            valueKey="id"
            v-model="tagsValue"
            :items="tag"
            @update:model-value="(value) => onUpdateArray('tags', value)"
          >
            <template
              v-if="tagsValue.length"
              #trailing
            >
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                icon="i-lucide-circle-x"
                aria-label="Clear input"
                @click.stop="
                  onUpdateArray('tags', '');
                  tagsValue = [];
                "
              />
            </template>
          </u-select-menu>
        </div>

        <div class="sidebar__item">
          <label>Количество глав</label>

          <div class="sidebar__item-input">
            <u-input
              placeholder="от"
              @update:value="(value) => onUpdateString('chaptersFrom', value)"
              :value="queries?.chaptersFrom"
            />
            <span />

            <u-input
              placeholder="до"
              @update:value="(value) => onUpdateString('chaptersTo', value)"
              :value="queries?.chaptersTo"
            />
          </div>
        </div>

        <div class="sidebar__item">
          <label>Год релиза</label>

          <div class="sidebar__item-input">
            <u-input
              placeholder="от"
              @update:value="(value) => onUpdateString('yearFrom', value)"
              :value="queries?.yearFrom"
            />
            <span />
            <u-input
              placeholder="до"
              @update:value="(value) => onUpdateString('yearTo', value)"
              :value="queries?.yearTo"
            />
          </div>
        </div>

        <!-- <div class="sidebar__item">
          <label>Количество оценок</label>

          <div class="sidebar__item-input">
            <u-input
              placeholder="от"
              @update:value="(value) => onUpdateString('rateFrom', value)"
              :value="queries?.rateFrom"
            />
            <span />
            <u-input
              placeholder="до"
              @update:value="(value) => onUpdateString('rateTo', value)"
              :value="queries?.rateTo"
            />
          </div>
        </div>

        <div class="sidebar__item rate">
          <label>Возрастной рейтинг</label>
          <u-checkbox-group
            class="sidebar__item-checkbox"
            :value="splitQueryValue(queries?.ageRate)"
            name="checkboxgroup"
            :options="BOOKS_AGE"
            @change="(value) => onUpdateArray('ageRate', value)"
          />
        </div>

        <div class="sidebar__item">
          <label>Тип</label>
          <u-checkbox-group
            class="sidebar__item-checkbox"
            name="checkboxgroup"
            :value="splitQueryValue(queries?.types)"
            :options="BOOKS_TYPE"
            @change="(value) => onUpdateArray('types', value)"
          />
        </div>

        <div class="sidebar__item">
          <label>Формат выпуска</label>
          <u-checkbox-group
            class="sidebar__item-checkbox"
            name="checkboxgroup"
            :value="splitQueryValue(queries?.release_type)"
            :options="RELEASE_TYPE"
            @change="(value) => onUpdateArray('release_type', value)"
          />
        </div>

        <div class="sidebar__item">
          <label>Статус перевода</label>
          <u-checkbox-group
            :value="splitQueryValue(queries?.status)"
            class="sidebar__item-checkbox"
            name="checkboxgroup"
            :options="STATUS"
            @change="(value) => onUpdateArray('status', value)"
          />
        </div>

        <div class="sidebar__item">
          <label>Другое</label>
          <u-checkbox-group
            class="sidebar__item-other sidebar__item-checkbox"
            name="checkboxgroup"
            :options="OTHER"
          />
        </div> -->
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.button {
  font-size: 32px;
  background-color: #0862e0;
  border-radius: 50%;
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sidebar {
  position: sticky;
  top: calc(var(--header-height) + 30px);
  align-self: flex-start;
  width: 320px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;

  &-wrapper {
    position: relative;
    height: 800px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 4px;
      height: 5px;
    }
    &::-webkit-scrollbar-thumb {
      border-radius: 6px;
      background-color: #e1e6e6;
    }
  }

  &-close {
    position: absolute;
    left: 45%;
    top: -20px;
    z-index: 1;
  }

  &-column {
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .rate {
    margin-top: 14px;
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
      font-size: 15px;
      padding-bottom: 8px;
    }
  }
}
</style>
