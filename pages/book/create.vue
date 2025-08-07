<script setup lang="ts">
import { z } from 'zod';

definePageMeta({
  middleware: ['auth'],
});

const ROUTES = [
  { label: 'Главная', to: '/' },
  { label: 'Профиль', to: '/profile' },
  { label: 'Мои работы', to: '/my-works' },
  { label: 'Создание книги', to: '/book/create' },
];

// Расширенная схема валидации
const schema = z.object({
  title: z
    .string()
    .min(1, 'Название книги обязательно')
    .max(200, 'Название не должно превышать 200 символов')
    .refine(
      (val) => val.trim().length >= 3,
      'Название должно содержать минимум 3 символа',
    ),
  description: z
    .string()
    .min(50, 'Описание должно содержать минимум 50 символов')
    .max(2000, 'Описание не должно превышать 2000 символов'),
  genre_ids: z
    .array(z.string())
    .min(1, 'Выберите хотя бы один жанр')
    .max(5, 'Можно выбрать максимум 5 жанров'),
  age_rating: z.enum(['0+', '6+', '12+', '16+', '18+']),
  tags: z
    .string()
    .optional()
    .refine(
      (val) => !val || val.split(',').length <= 10,
      'Можно указать максимум 10 тегов',
    ),
});

type Schema = z.output<typeof schema>;

// Состояние формы
const state = reactive<Schema>({
  title: '',
  description: '',
  genre_ids: [],
  age_rating: '16+',
  tags: '',
});

// Состояние UI
const isLoading = ref(false);
const currentStep = ref(1);
const totalSteps = 3;
const showPreview = ref(false);
const errors = ref<Record<string, string>>({});

// Загрузка жанров
const { data: genres } = await useFetch('/api/genres');

// Опции возрастного рейтинга с описаниями
const ageRatingOptions = [
  {
    label: '0+',
    value: '0+',
    description: 'Для всех возрастов',
    icon: 'i-lucide-baby',
  },
  {
    label: '6+',
    value: '6+',
    description: 'Для детей от 6 лет',
    icon: 'i-lucide-smile',
  },
  {
    label: '12+',
    value: '12+',
    description: 'Для подростков от 12 лет',
    icon: 'i-lucide-user',
  },
  {
    label: '16+',
    value: '16+',
    description: 'Для молодежи от 16 лет',
    icon: 'i-lucide-users',
  },
  {
    label: '18+',
    value: '18+',
    description: 'Только для взрослых',
    icon: 'i-lucide-shield-alert',
  },
];

// Вычисляемые свойства
const selectedGenres = computed(
  () =>
    genres.value?.filter((genre: any) => state.genre_ids.includes(genre.id)) ||
    [],
);

const tagsArray = computed(() =>
  state.tags
    ? state.tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [],
);

const isStepValid = computed(() => {
  switch (currentStep.value) {
    case 1:
      return state.title.trim().length >= 3 && state.description.length >= 50;
    case 2:
      return state.genre_ids.length > 0 && state.genre_ids.length <= 5;
    case 3:
      return true; // Последний шаг всегда валиден
    default:
      return false;
  }
});

const canProceed = computed(() => isStepValid.value && !isLoading.value);

// Методы навигации по шагам
const nextStep = () => {
  if (canProceed.value && currentStep.value < totalSteps) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

// Валидация в реальном времени
const validateField = (field: keyof Schema) => {
  try {
    const fieldSchema = schema.shape[field];
    fieldSchema.parse(state[field]);
    delete errors.value[field];
  } catch (error: any) {
    if (error.errors?.[0]?.message) {
      errors.value[field] = error.errors[0].message;
    }
  }
};

// Обработка отправки формы
const onSubmit = async () => {
  try {
    isLoading.value = true;
    errors.value = {};

    // Финальная валидация
    const validatedData = schema.parse(state);

    const response = await $fetch('/api/book/create', {
      method: 'POST',
      body: {
        title: validatedData.title.trim(),
        description: validatedData.description.trim(),
        genre_ids: validatedData.genre_ids,
        age_rating: validatedData.age_rating,
        tags: validatedData.tags
          ? validatedData.tags
              .split(',')
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
      },
    });

    // Показываем уведомление об успехе
    const toast = useToast();
    toast.add({
      title: 'Книга создана успешно!',
      description: 'Теперь вы можете добавить главы и настроить оформление',
      icon: 'i-lucide-check-circle',
      color: 'success',
    });

    // Перенаправляем на страницу редактирования
    await navigateTo(`/book/${response.id}/edit`);
  } catch (error: any) {
    console.error('Ошибка создания книги:', error);

    const toast = useToast();
    toast.add({
      title: 'Ошибка создания книги',
      description:
        error.data?.message ||
        'Произошла неожиданная ошибка. Попробуйте еще раз.',
      icon: 'i-lucide-alert-circle',
      color: 'error',
    });

    // Если ошибка валидации, показываем детали
    if (error.data?.errors) {
      errors.value = error.data.errors;
    }
  } finally {
    isLoading.value = false;
  }
};

// Сброс формы
const resetForm = () => {
  Object.assign(state, {
    title: '',
    description: '',
    genre_ids: [],
    age_rating: '16+',
    tags: '',
  });
  currentStep.value = 1;
  errors.value = {};
};
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb>
      <r-breadcrumb :options="ROUTES" />
    </template>

    <template #title>
      <div class="flex flex-col">
        <r-header
          bottom="0"
          class="uppercase text-[#003386]"
        >
          Создание книги
        </r-header>

        <!-- Индикатор прогресса -->
        <div class="flex items-center gap-3 mt-3">
          <span class="text-sm text-gray-600">
            Шаг {{ currentStep }} из {{ totalSteps }}
          </span>
          <UProgress
            :value="(currentStep / totalSteps) * 100"
            class="w-32"
            color="info"
          />
        </div>
      </div>
    </template>

    <div class="create-book-container max-w-7xl mx-auto px-4">
      <!-- Навигация по шагам -->
      <div class="mb-8">
        <nav class="flex justify-center">
          <ol class="flex items-center space-x-4">
            <li
              v-for="step in totalSteps"
              :key="step"
              class="flex items-center"
            >
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200"
                :class="{
                  'bg-[#0862E0] border-[#0862E0] text-white':
                    step <= currentStep,
                  'border-gray-300 text-gray-400': step > currentStep,
                }"
              >
                <UIcon
                  v-if="step < currentStep"
                  name="i-lucide-check"
                  class="w-5 h-5"
                />
                <span
                  v-else
                  class="text-sm font-medium"
                  >{{ step }}</span
                >
              </div>

              <div
                v-if="step < totalSteps"
                class="w-16 h-0.5 ml-4 transition-colors duration-200"
                :class="{
                  'bg-[#0862E0]': step < currentStep,
                  'bg-gray-300': step >= currentStep,
                }"
              />
            </li>
          </ol>
        </nav>

        <!-- Названия шагов -->
        <div class="flex justify-center mt-4">
          <div class="flex space-x-20 text-sm">
            <span
              class="transition-colors duration-200"
              :class="{
                'text-[#0862E0] font-medium': currentStep === 1,
                'text-gray-600': currentStep !== 1,
              }"
            >
              Основная информация
            </span>
            <span
              class="transition-colors duration-200"
              :class="{
                'text-[#0862E0] font-medium': currentStep === 2,
                'text-gray-600': currentStep !== 2,
              }"
            >
              Жанры и категории
            </span>
            <span
              class="transition-colors duration-200"
              :class="{
                'text-[#0862E0] font-medium': currentStep === 3,
                'text-gray-600': currentStep !== 3,
              }"
            >
              Финализация
            </span>
          </div>
        </div>
      </div>

      <!-- Контент формы -->
      <div
        class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl"
      >
        <!-- Шаг 1: Основная информация -->
        <Transition
          name="step-transition"
          mode="out-in"
        >
          <div
            v-if="currentStep === 1"
            key="step-1"
            class="p-8 bg-gradient-to-br from-blue-50/50 to-indigo-50/30"
          >
            <!-- Заголовок секции с улучшенным дизайном -->
            <div class="mb-8 text-center">
              <div
                class="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#0862E0] to-[#003386] rounded-2xl mb-4 shadow-lg"
              >
                <UIcon
                  name="i-lucide-book-open"
                  class="w-8 h-8 text-white"
                />
              </div>
              <h2
                class="text-3xl font-bold bg-gradient-to-r from-[#003386] to-[#0862E0] bg-clip-text text-transparent mb-3"
              >
                Основная информация о книге
              </h2>
              <p
                class="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed"
              >
                Создайте привлекательное описание вашего произведения.
                Качественная презентация — ключ к успеху у читателей и первый
                шаг к популярности вашей книги.
              </p>

              <!-- Индикатор прогресса заполнения -->
              <div class="mt-6 flex items-center justify-center gap-4">
                <div class="flex items-center gap-2">
                  <div
                    class="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-green-500 shadow-sm"
                  ></div>
                  <span class="text-sm text-gray-600"
                    >Заполнено полей:
                    {{
                      Object.values({
                        title: state.title,
                        description: state.description,
                      }).filter((v) => v && v.length > 0).length
                    }}/2</span
                  >
                </div>
              </div>
            </div>

            <div class="space-y-8 w-full max-w-none">
              <!-- Название книги -->
              <div
                class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 w-full"
              >
                <UFormGroup
                  label="Название книги"
                  name="title"
                  required
                  :error="errors.title"
                  class="space-y-3 w-full"
                >
                  <template #label>
                    <div class="flex items-center gap-3 mb-2">
                      <div
                        class="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl"
                      >
                        <UIcon
                          name="i-lucide-pen-tool"
                          class="w-5 h-5 text-[#0862E0]"
                        />
                      </div>
                      <div class="flex-1">
                        <span class="text-base font-semibold text-gray-800"
                          >Название книги</span
                        >
                        <span class="text-red-500 ml-1">*</span>
                        <p class="text-sm text-gray-500 mt-1">
                          Придумайте запоминающееся название, которое отражает
                          суть произведения
                        </p>
                      </div>
                    </div>
                  </template>

                  <UInput
                    v-model="state.title"
                    placeholder="Например: 'Тайны забытого королевства' или 'Последний рассвет'"
                    size="lg"
                    class="!w-full !max-w-none"
                    :ui="{
                      base: 'bg-gradient-to-r from-gray-50 to-blue-50/30 border-2 border-gray-200 focus:border-[#0862E0] focus:ring-4 focus:ring-[#0862E0]/20 rounded-xl transition-all duration-300 hover:border-blue-300 focus:bg-white text-lg min-h-[60px] px-6 py-4 !w-full !max-w-none',
                    }"
                    @blur="validateField('title')"
                    @input="validateField('title')"
                  />

                  <div class="flex justify-between items-center text-sm">
                    <div class="flex items-center gap-2">
                      <UIcon
                        :name="
                          state.title.length >= 3
                            ? 'i-lucide-check-circle'
                            : 'i-lucide-info'
                        "
                        :class="
                          state.title.length >= 3
                            ? 'text-green-500'
                            : 'text-gray-400'
                        "
                        class="w-4 h-4"
                      />
                      <span
                        :class="
                          state.title.length >= 3
                            ? 'text-green-600'
                            : 'text-gray-500'
                        "
                      >
                        {{
                          state.title.length >= 3
                            ? 'Отлично!'
                            : 'Минимум 3 символа'
                        }}
                      </span>
                    </div>
                    <span class="text-gray-500 font-mono"
                      >{{ state.title.length }}/200</span
                    >
                  </div>
                </UFormGroup>
              </div>

              <!-- Описание -->
              <div
                class="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 w-full"
              >
                <UFormGroup
                  label="Описание"
                  name="description"
                  required
                  :error="errors.description"
                  class="space-y-3 w-full"
                >
                  <template #label>
                    <div class="flex items-center gap-3 mb-2">
                      <div
                        class="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl"
                      >
                        <UIcon
                          name="i-lucide-file-text"
                          class="w-5 h-5 text-purple-600"
                        />
                      </div>
                      <div class="flex-1">
                        <span class="text-base font-semibold text-gray-800"
                          >Описание книги</span
                        >
                        <span class="text-red-500 ml-1">*</span>
                        <p class="text-sm text-gray-500 mt-1">
                          Расскажите о сюжете, героях и атмосфере. Заинтригуйте
                          потенциальных читателей
                        </p>
                      </div>
                    </div>
                  </template>

                  <UTextarea
                    v-model="state.description"
                    placeholder="В далёком королевстве, где магия переплетается с реальностью, молодая волшебница отправляется в опасное путешествие, чтобы спасти свой народ от древнего проклятия"
                    :rows="10"
                    class="!w-full !max-w-none"
                    :ui="{
                      base: 'bg-gradient-to-r from-gray-50 to-purple-50/30 border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/20 rounded-xl transition-all duration-300 resize-none hover:border-purple-300 focus:bg-white text-base leading-relaxed min-h-[200px] px-6 py-4 !w-full !max-w-none',
                    }"
                    @blur="validateField('description')"
                    @input="validateField('description')"
                  />

                  <div class="flex justify-between items-center text-sm">
                    <div class="flex items-center gap-2">
                      <UIcon
                        :name="
                          state.description.length >= 50
                            ? 'i-lucide-check-circle'
                            : 'i-lucide-info'
                        "
                        :class="
                          state.description.length >= 50
                            ? 'text-green-500'
                            : 'text-gray-400'
                        "
                        class="w-4 h-4"
                      />
                      <span
                        :class="
                          state.description.length >= 50
                            ? 'text-green-600'
                            : 'text-gray-500'
                        "
                      >
                        {{
                          state.description.length >= 50
                            ? 'Превосходно!'
                            : 'Минимум 50 символов'
                        }}
                      </span>
                    </div>
                    <span class="text-gray-500 font-mono"
                      >{{ state.description.length }}/2000</span
                    >
                  </div>

                  <!-- Подсказки для написания описания -->
                  <div
                    class="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100"
                  >
                    <div class="flex items-start gap-3">
                      <UIcon
                        name="i-lucide-lightbulb"
                        class="w-5 h-5 text-blue-600 mt-0.5"
                      />
                      <div>
                        <h4 class="text-sm font-semibold text-blue-800 mb-2">
                          Советы для отличного описания:
                        </h4>
                        <ul class="text-sm text-blue-700 space-y-1">
                          <li>• Опишите главного героя и его цель</li>
                          <li>• Намекните на конфликт или проблему</li>
                          <li>
                            • Создайте интригу, но не раскрывайте концовку
                          </li>
                          <li>• Передайте атмосферу и настроение книги</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </UFormGroup>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Шаг 2: Жанры и категории -->
        <Transition
          name="step-transition"
          mode="out-in"
        >
          <div
            v-if="currentStep === 2"
            key="step-2"
            class="p-8"
          >
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                Жанры и категории
              </h2>
              <p class="text-gray-600">
                Выберите жанры и возрастной рейтинг. Это поможет читателям найти
                вашу книгу.
              </p>
            </div>

            <div class="space-y-8">
              <!-- Жанры -->
              <UFormGroup
                label="Жанры"
                name="genre_ids"
                required
                :error="errors.genre_ids"
                class="space-y-4"
              >
                <template #label>
                  <div class="flex items-center gap-2 mb-4">
                    <UIcon
                      name="i-lucide-tags"
                      class="w-4 h-4 text-[#0862E0]"
                    />
                    <span class="text-sm font-medium text-gray-700"
                      >Жанры книги</span
                    >
                    <span class="text-red-500">*</span>
                    <span class="text-xs text-gray-500 ml-2">
                      (выберите от 1 до 5 жанров)
                    </span>
                  </div>
                </template>

                <!-- Выбранные жанры -->
                <div
                  v-if="selectedGenres.length > 0"
                  class="mb-4"
                >
                  <div class="flex flex-wrap gap-2">
                    <UBadge
                      v-for="genre in selectedGenres"
                      :key="genre.id"
                      color="info"
                      variant="soft"
                      class="px-3 py-1 text-sm"
                    >
                      {{ genre.name }}
                      <UButton
                        icon="i-lucide-x"
                        size="xs"
                        color="neutral"
                        variant="ghost"
                        class="ml-1 -mr-1"
                        @click="
                          state.genre_ids = state.genre_ids.filter(
                            (id) => id !== genre.id,
                          )
                        "
                      />
                    </UBadge>
                  </div>
                </div>

                <!-- Сетка жанров -->
                <div
                  class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                >
                  <label
                    v-for="genre in genres"
                    :key="genre.id"
                    class="group relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md"
                    :class="{
                      'border-[#0862E0] bg-blue-50': state.genre_ids.includes(
                        genre.id,
                      ),
                      'border-gray-200 bg-white hover:border-gray-300':
                        !state.genre_ids.includes(genre.id),
                      'opacity-50 cursor-not-allowed':
                        state.genre_ids.length >= 5 &&
                        !state.genre_ids.includes(genre.id),
                    }"
                  >
                    <UCheckbox
                      :model-value="state.genre_ids.includes(genre.id)"
                      :disabled="
                        state.genre_ids.length >= 5 &&
                        !state.genre_ids.includes(genre.id)
                      "
                      class="mr-3"
                      @update:model-value="
                        (checked) => {
                          if (checked && state.genre_ids.length < 5) {
                            state.genre_ids.push(genre.id);
                          } else if (!checked) {
                            const index = state.genre_ids.indexOf(genre.id);
                            if (index > -1) state.genre_ids.splice(index, 1);
                          }
                          validateField('genre_ids');
                        }
                      "
                    />
                    <span
                      class="text-sm font-medium transition-colors duration-200"
                      :class="{
                        'text-[#0862E0]': state.genre_ids.includes(genre.id),
                        'text-gray-700': !state.genre_ids.includes(genre.id),
                      }"
                    >
                      {{ genre.name }}
                    </span>
                  </label>
                </div>

                <div class="text-xs text-gray-500 mt-2">
                  Выбрано: {{ state.genre_ids.length }}/5 жанров
                </div>
              </UFormGroup>

              <!-- Возрастной рейтинг -->
              <UFormGroup
                label="Возрастной рейтинг"
                name="age_rating"
                required
                class="space-y-4"
              >
                <template #label>
                  <div class="flex items-center gap-2 mb-4">
                    <UIcon
                      name="i-lucide-shield-check"
                      class="w-4 h-4 text-[#0862E0]"
                    />
                    <span class="text-sm font-medium text-gray-700"
                      >Возрастной рейтинг</span
                    >
                    <span class="text-red-500">*</span>
                  </div>
                </template>

                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <label
                    v-for="option in ageRatingOptions"
                    :key="option.value"
                    class="group relative flex items-center p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md"
                    :class="{
                      'border-[#0862E0] bg-blue-50':
                        state.age_rating === option.value,
                      'border-gray-200 bg-white hover:border-gray-300':
                        state.age_rating !== option.value,
                    }"
                  >
                    <URadio
                      v-model="state.age_rating"
                      :value="option.value"
                      class="mr-3"
                    />
                    <div class="flex items-center gap-3">
                      <UIcon
                        :name="option.icon"
                        class="w-5 h-5"
                        :class="{
                          'text-[#0862E0]': state.age_rating === option.value,
                          'text-gray-400': state.age_rating !== option.value,
                        }"
                      />
                      <div>
                        <div
                          class="font-medium transition-colors duration-200"
                          :class="{
                            'text-[#0862E0]': state.age_rating === option.value,
                            'text-gray-900': state.age_rating !== option.value,
                          }"
                        >
                          {{ option.label }}
                        </div>
                        <div class="text-xs text-gray-500">
                          {{ option.description }}
                        </div>
                      </div>
                    </div>
                  </label>
                </div>
              </UFormGroup>

              <!-- Теги -->
              <UFormGroup
                label="Теги"
                name="tags"
                :error="errors.tags"
                class="space-y-4"
              >
                <template #label>
                  <div class="flex items-center gap-2 mb-4">
                    <UIcon
                      name="i-lucide-hash"
                      class="w-4 h-4 text-[#0862E0]"
                    />
                    <span class="text-sm font-medium text-gray-700">Теги</span>
                    <span class="text-xs text-gray-500 ml-2">
                      (необязательно, через запятую)
                    </span>
                  </div>
                </template>

                <UInput
                  v-model="state.tags"
                  placeholder="фантастика, приключения, магия, дружба"
                  size="lg"
                  :ui="{
                    base: 'bg-gray-50 border-gray-200 focus:border-[#0862E0] focus:ring-[#0862E0] rounded-xl transition-all duration-200',
                  }"
                  @blur="validateField('tags')"
                />

                <!-- Превью тегов -->
                <div
                  v-if="tagsArray.length > 0"
                  class="flex flex-wrap gap-2 mt-3"
                >
                  <UBadge
                    v-for="tag in tagsArray"
                    :key="tag"
                    color="neutral"
                    variant="soft"
                    class="px-2 py-1 text-xs"
                  >
                    #{{ tag }}
                  </UBadge>
                </div>

                <div class="text-xs text-gray-500">
                  Теги помогают читателям найти книги по интересам. Максимум 10
                  тегов.
                </div>
              </UFormGroup>
            </div>
          </div>
        </Transition>

        <!-- Шаг 3: Финализация -->
        <Transition
          name="step-transition"
          mode="out-in"
        >
          <div
            v-if="currentStep === 3"
            key="step-3"
            class="p-8"
          >
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-2">
                Проверьте данные и создайте книгу
              </h2>
              <p class="text-gray-600">
                Убедитесь, что все данные указаны корректно. После создания вы
                сможете добавить главы и настроить оформление.
              </p>
            </div>

            <!-- Превью книги -->
            <div
              class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100"
            >
              <div class="flex items-start gap-6">
                <!-- Обложка-заглушка -->
                <div
                  class="flex-shrink-0 w-32 h-48 bg-gradient-to-br from-[#0862E0] to-[#003386] rounded-lg shadow-lg flex items-center justify-center"
                >
                  <div class="text-center text-white p-4">
                    <UIcon
                      name="i-lucide-book-open"
                      class="w-8 h-8 mx-auto mb-2"
                    />
                    <div class="text-xs font-medium">
                      Обложка будет добавлена позже
                    </div>
                  </div>
                </div>

                <!-- Информация о книге -->
                <div class="flex-1 min-w-0">
                  <h3 class="text-xl font-bold text-gray-900 mb-2 truncate">
                    {{ state.title || 'Название книги' }}
                  </h3>

                  <div class="space-y-3">
                    <!-- Описание -->
                    <div>
                      <h4 class="text-sm font-medium text-gray-700 mb-1">
                        Описание:
                      </h4>
                      <p class="text-sm text-gray-600 line-clamp-3">
                        {{ state.description || 'Описание книги' }}
                      </p>
                    </div>

                    <!-- Жанры -->
                    <div>
                      <h4 class="text-sm font-medium text-gray-700 mb-2">
                        Жанры:
                      </h4>
                      <div class="flex flex-wrap gap-1">
                        <UBadge
                          v-for="genre in selectedGenres"
                          :key="genre.id"
                          color="info"
                          variant="soft"
                          size="sm"
                        >
                          {{ genre.name }}
                        </UBadge>
                      </div>
                    </div>

                    <!-- Возрастной рейтинг -->
                    <div class="flex items-center gap-2">
                      <h4 class="text-sm font-medium text-gray-700">
                        Возрастной рейтинг:
                      </h4>
                      <UBadge
                        :color="
                          state.age_rating === '18+'
                            ? 'error'
                            : state.age_rating === '16+'
                              ? 'warning'
                              : 'success'
                        "
                        variant="soft"
                      >
                        {{ state.age_rating }}
                      </UBadge>
                    </div>

                    <!-- Теги -->
                    <div v-if="tagsArray.length > 0">
                      <h4 class="text-sm font-medium text-gray-700 mb-2">
                        Теги:
                      </h4>
                      <div class="flex flex-wrap gap-1">
                        <UBadge
                          v-for="tag in tagsArray"
                          :key="tag"
                          color="neutral"
                          variant="soft"
                          size="sm"
                        >
                          #{{ tag }}
                        </UBadge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Дополнительная информация -->
            <div
              class="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl"
            >
              <div class="flex items-start gap-3">
                <UIcon
                  name="i-lucide-info"
                  class="w-5 h-5 text-amber-600 mt-0.5"
                />
                <div class="text-sm text-amber-800">
                  <p class="font-medium mb-1">Что будет дальше?</p>
                  <ul class="space-y-1 text-xs">
                    <li>• После создания книги вы перейдете в редактор</li>
                    <li>• Сможете добавить главы и написать содержание</li>
                    <li>• Настроить обложку и типографику</li>
                    <li>• Опубликовать книгу для читателей</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Навигационные кнопки -->
        <div class="px-8 py-6 bg-gray-50 border-t border-gray-100">
          <div class="flex justify-between items-center">
            <!-- Кнопка "Назад" -->
            <UButton
              v-if="currentStep > 1"
              variant="outline"
              size="lg"
              icon="i-lucide-arrow-left"
              class="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl px-6"
              @click="prevStep"
            >
              Назад
            </UButton>
            <div v-else></div>

            <!-- Кнопки справа -->
            <div class="flex gap-3">
              <!-- Кнопка "Отмена" -->
              <UButton
                variant="ghost"
                size="lg"
                class="text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl px-6"
                @click="navigateTo('/my-works')"
              >
                Отмена
              </UButton>

              <!-- Кнопка "Далее" или "Создать" -->
              <UButton
                v-if="currentStep < totalSteps"
                size="lg"
                icon="i-lucide-arrow-right"
                trailing
                :disabled="!canProceed"
                class="bg-[#0862E0] hover:bg-[#0652C0] active:bg-[#003386] text-white rounded-xl px-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                @click="nextStep"
              >
                Далее
              </UButton>

              <UButton
                v-else
                size="lg"
                icon="i-lucide-plus"
                :loading="isLoading"
                :disabled="!canProceed"
                class="bg-gradient-to-r from-[#0862E0] to-[#0652C0] hover:from-[#0652C0] hover:to-[#003386] active:from-[#003386] active:to-[#002266] text-white rounded-xl px-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                @click="onSubmit"
              >
                {{ isLoading ? 'Создание...' : 'Создать книгу' }}
              </UButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.create-book-container {
  padding: 30px 20px;
}

/* Принудительное расширение полей ввода */
:deep(.ui-input),
:deep(.ui-textarea) {
  width: 100% !important;
  max-width: none !important;
  min-width: 100% !important;
}

:deep(.ui-form-group) {
  width: 100% !important;
  max-width: none !important;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Анимации для переходов между шагами */
.step-transition-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.step-transition-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.06, 0.68, 0.19);
}

.step-transition-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.95);
}

.step-transition-leave-to {
  opacity: 0;
  transform: translateX(-50px) scale(0.95);
}

/* Улучшенные hover эффекты */
.hover-lift {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
}

/* Анимация для индикатора прогресса */
.progress-bar {
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Пульсация для активных элементов */
@keyframes pulse-soft {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.pulse-soft {
  animation: pulse-soft 2s infinite;
}

/* Улучшенные стили для чекбоксов и радио */
.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}

/* Стили для индикатора прогресса */
.progress-step {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Стили для превью книги */
.book-preview {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

/* Адаптивность */
@media (max-width: 768px) {
  .create-book-container {
    padding: 20px 16px;
  }

  .step-navigation {
    flex-direction: column;
    gap: 12px;
  }

  .step-names {
    flex-direction: column;
    gap: 8px;
    text-align: center;
  }
}
</style>
