<script setup lang="ts">
import { z } from 'zod';

interface Props {
  modelValue?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
  (e: 'created', book: any): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
});

const emit = defineEmits<Emits>();

const open = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

// Форма создания книги
const form = reactive({
  title: '',
  description: '',
  status: 'В процессе',
  year: new Date().getFullYear(),
  genre_ids: [] as string[],
});

// Состояние загрузки
const isLoading = ref(false);
const error = ref('');

// Получение списка жанров
const { data: genres } = await useFetch('/api/genres', {
  default: () => [],
});

const genreOptions = computed(
  () =>
    genres.value?.map((genre: any) => ({
      label: genre.name,
      value: genre.id,
    })) || [],
);

const statusOptions = [
  { label: 'В процессе', value: 'В процессе' },
  { label: 'Завершенный', value: 'Завершенный' },
  { label: 'Заморожено', value: 'Заморожено' },
  { label: 'Заброшен', value: 'Заброшен' },
];

// Валидация формы
const schema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  status: z.string(),
  year: z
    .number()
    .min(1900)
    .max(new Date().getFullYear() + 10),
  genre_ids: z.array(z.string()).optional(),
});

const isFormValid = computed(() => {
  try {
    schema.parse(form);
    return true;
  } catch {
    return false;
  }
});

// Создание книги
const createBook = async () => {
  if (!isFormValid.value) return;

  isLoading.value = true;
  error.value = '';

  try {
    const response = await $fetch('/api/book/create', {
      method: 'POST',
      body: form,
    });

    if (response.success) {
      emit('created', response.book);
      open.value = false;
      resetForm();

      // Перенаправление на страницу редактирования
      await navigateTo(`/book/${response.book.id}/edit`);
    }
  } catch (err: any) {
    console.error('Ошибка создания книги:', err);
    error.value = err.data?.message || 'Произошла ошибка при создании книги';
  } finally {
    isLoading.value = false;
  }
};

// Сброс формы
const resetForm = () => {
  form.title = '';
  form.description = '';
  form.status = 'В процессе';
  form.year = new Date().getFullYear();
  form.genre_ids = [];
  error.value = '';
};

// Закрытие модального окна
const closeModal = () => {
  open.value = false;
  resetForm();
};
</script>

<template>
  <u-modal
    v-model:open="open"
    :ui="{
      content:
        'grid gap-4 rounded-[10px] divide-y-0 p-7 max-sm:max-w-[calc(100vw-8px)] sm:max-w-2xl max-h-[90vh] overflow-y-auto',
    }"
  >
    <u-button
      color="info"
      class="text-sm font-bold rounded-[10px]"
      size="lg"
    >
      Создать книгу
    </u-button>

    <template #content>
      <div class="flex flex-wrap items-center justify-between mb-4">
        <span class="font-bold text-[22px]">Создать новую книгу</span>
      </div>

      <!-- Ошибка -->
      <div
        v-if="error"
        class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
      >
        {{ error }}
      </div>

      <form
        @submit.prevent="createBook"
        class="space-y-4"
      >
        <!-- Название -->
        <div class="grid gap-1">
          <label class="text-[15px] font-medium">Название книги *</label>
          <u-input
            v-model="form.title"
            placeholder="Введите название книги"
            class="rounded-[10px]"
            size="lg"
            required
          />
        </div>

        <!-- Описание -->
        <div class="grid gap-1">
          <label class="text-[15px] font-medium">Описание</label>
          <u-textarea
            v-model="form.description"
            placeholder="Краткое описание книги"
            class="rounded-[10px]"
            :rows="3"
          />
        </div>

        <!-- Статус и год -->
        <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
          <div class="grid gap-1">
            <label class="text-[15px] font-medium">Статус</label>
            <u-select
              v-model="form.status"
              :options="statusOptions"
              class="rounded-[10px]"
              size="lg"
            />
          </div>

          <div class="grid gap-1">
            <label class="text-[15px] font-medium">Год</label>
            <u-input
              v-model.number="form.year"
              type="number"
              :min="1900"
              :max="new Date().getFullYear() + 10"
              class="rounded-[10px]"
              size="lg"
            />
          </div>
        </div>

        <!-- Жанры -->
        <div class="grid gap-1">
          <label class="text-[15px] font-medium">Жанры</label>
          <u-select-menu
            v-model="form.genre_ids"
            :options="genreOptions"
            multiple
            placeholder="Выберите жанры"
            class="rounded-[10px]"
          />
        </div>

        <!-- Кнопки -->
        <div class="flex gap-2 pt-4">
          <u-button
            type="button"
            variant="outline"
            color="neutral"
            class="rounded-[10px] flex-1"
            size="lg"
            @click="closeModal"
            :disabled="isLoading"
          >
            Отмена
          </u-button>

          <u-button
            type="submit"
            color="info"
            class="rounded-[10px] flex-1 font-bold"
            size="lg"
            :loading="isLoading"
            :disabled="!isFormValid || isLoading"
          >
            Создать книгу
          </u-button>
        </div>
      </form>
    </template>
  </u-modal>
</template>
