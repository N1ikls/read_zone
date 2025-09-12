<script setup lang="ts">
import { STATUS } from '@/shared/consts';
import type { SelectValue } from 'ant-design-vue/es/select';
import { BOOKS_TYPE, BOOKS_AGE, RELEASE_TYPE, OTHER } from '../../consts';
import { useCatalogState } from '../../models';

const { queries = {} } = defineProps<{
  queries: Record<string, string | number | string[] | undefined>;
}>();

const setRouteQueries = useSetRouteQuery();

const catalogState = useCatalogState();

const { showSidebar } = catalogState;

const { data: tag } = useFetch('/api/tag', {
  key: 'catalog-tags',
  default: () => [],
});
const { data: genres } = useFetch('/api/genres', {
  key: 'catalog-genres',
  default: () => [],
});

const tagsValue = ref(splitQueryValue(queries?.tags as string));
const genresValue = ref(splitQueryValue(queries?.genres as string));

// Добавляем реактивные значения для чекбоксов
const ageRateValue = ref(splitQueryValue(queries?.ageRate as string));
const typesValue = ref(splitQueryValue(queries?.types as string));
const releaseTypeValue = ref(splitQueryValue(queries?.release_type as string));
const statusValue = ref(splitQueryValue(queries?.status as string));

// Watchers для чекбоксов - обновляют route query при изменении
watch(ageRateValue, (newValue) => onUpdateArray('ageRate', newValue));
watch(typesValue, (newValue) => onUpdateArray('types', newValue));
watch(releaseTypeValue, (newValue) => onUpdateArray('release_type', newValue));
watch(statusValue, (newValue) => onUpdateArray('status', newValue));

const onUpdateString = (key: string, value: SelectValue | Event) => {
  // Обрабатываем Event объекты
  let processedValue = value;
  
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    // Если это Event объект, попробуем извлечь значение
    if (value.constructor?.name === 'Event' || value.toString() === '[object Event]') {
      if ((value as any).target?.value !== undefined) {
        processedValue = (value as any).target.value;
      } else if ((value as any).detail !== undefined) {
        processedValue = (value as any).detail;
      } else {
        console.error(`Cannot extract value from Event for ${key}:`, value);
        return;
      }
    }
  }
  
  setRouteQueries(
    resetPaginationQuery({
      [key]: processedValue as string | string[],
    }),
  );
};

const onUpdateArray = (key: string, value: string[] | string | Event) => {
  // Обрабатываем Event объекты от чекбоксов
  let processedValue = value;
  
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    console.warn(`Received Event object for ${key}:`, value);
    
    // Для Event объектов от u-checkbox-group значение может быть в разных местах
    if (value.constructor?.name === 'Event' || value.toString() === '[object Event]') {
      const event = value as any;
      
      // Пробуем разные способы извлечения значения
      if (event.target?.value !== undefined && event.target.value !== null) {
        processedValue = event.target.value;
      } else if (event.detail !== undefined) {
        processedValue = event.detail;
      } else if (event.target?.checked !== undefined) {
        // Для одиночных чекбоксов
        processedValue = event.target.checked ? event.target.value || 'true' : '';
      } else {
        return;
      }
    }
  }
  
  console.log(`Setting ${key} to:`, processedValue);
  
  setRouteQueries(
    resetPaginationQuery({
      [key]: Array.isArray(processedValue) ? processedValue.join(',') : (processedValue as string),
    }),
  );
};
</script>

<template>
  <div class="sidebar">
    <div class="sidebar-close">
      <button
        @click="showSidebar"
        class="button"
      >
        <u-icon
          mode="svg"
          name="my-icons:close"
        />
      </button>
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
            @update:model-value="(value: any) => onUpdateArray('genres', value)"
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
            @update:model-value="(value: any) => onUpdateArray('tags', value)"
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
              @update:value="(value: any) => onUpdateString('chaptersFrom', value)"
              :value="queries?.chaptersFrom"
            />
            <span />

            <u-input
              placeholder="до"
              @update:value="(value: any) => onUpdateString('chaptersTo', value)"
              :value="queries?.chaptersTo"
            />
          </div>
        </div>

        <div class="sidebar__item">
          <label>Год релиза</label>

          <div class="sidebar__item-input">
            <u-input
              placeholder="от"
              @update:value="(value: any) => onUpdateString('yearFrom', value)"
              :value="queries?.yearFrom"
            />
            <span />
            <u-input
              placeholder="до"
              @update:value="(value: any) => onUpdateString('yearTo', value)"
              :value="queries?.yearTo"
            />
          </div>
        </div>

        <div class="sidebar__item">
          <label>Количество оценок</label>

          <div class="sidebar__item-input">
            <u-input
              placeholder="от"
              @update:value="(value: any) => onUpdateString('rateFrom', value)"
              :value="queries?.rateFrom"
            />
            <span />
            <u-input
              placeholder="до"
              @update:value="(value: any) => onUpdateString('rateTo', value)"
              :value="queries?.rateTo"
            />
          </div>
        </div>

        <div class="sidebar__item rate">
          <label>Возрастной рейтинг</label>
          <u-checkbox-group
            color="secondary"
            v-model="ageRateValue"
            name="checkboxgroup"
            :items="BOOKS_AGE"
            :ui="{
              fieldset: 'sidebar__item-checkbox',
            }"
          />
        </div>

        <div class="sidebar__item">
          <label>Тип</label>
          <u-checkbox-group
            color="secondary"
            :ui="{
              fieldset: 'sidebar__item-checkbox',
            }"
            name="checkboxgroup"
            v-model="typesValue"
            :items="BOOKS_TYPE"
          />
        </div>

        <div class="sidebar__item">
          <label>Формат выпуска</label>
          <u-checkbox-group
            color="secondary"
            :ui="{
              fieldset: 'sidebar__item-checkbox',
            }"
            name="checkboxgroup"
            v-model="releaseTypeValue"
            :items="RELEASE_TYPE"
          />
        </div>

        <div class="sidebar__item">
          <label>Статус перевода</label>
          <u-checkbox-group
            color="secondary"
            v-model="statusValue"
            :ui="{
              fieldset: 'sidebar__item-checkbox',
            }"
            name="checkboxgroup"
            :items="STATUS"
          />
        </div>

        <div class="sidebar__item">
          <label>Другое</label>
          <u-checkbox-group
            color="secondary"
            :ui="{
              fieldset: 'sidebar__item-checkbox',
            }"
            name="checkboxgroup"
            :items="OTHER"
          />
        </div>
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
  cursor: pointer;
  :deep(path) {
    color: #ffffff;
  }
}

.sidebar {
  position: sticky;
  top: calc(var(--header-height) + 30px);
  align-self: flex-start;
  width: 320px;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  background-color: #ffffff;

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

    :deep(.sidebar__item-checkbox) {
      width: 100%;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;

      button {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 25px;
        height: 25px;
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
