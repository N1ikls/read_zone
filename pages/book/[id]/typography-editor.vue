<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();
const bookId = route.params.id as string;

const ROUTES = [
  { label: 'Главная', to: '/' },
  { label: 'Профиль', to: '/profile' },
  { label: 'Мои работы', to: '/my-works' },
  { label: 'Главы', to: `/book/${bookId}/edit` },
  { label: 'Редактор типографики', to: `/book/${bookId}/typography-editor` },
];

// Загрузка данных книги
const { data: book } = await useFetch(`/api/book/${bookId}`);

// Загрузка существующих настроек типографики
const { data: existingSettings } = await useFetch(
  `/api/book/${bookId}/typography`,
);

// Настройки типографики с загруженными значениями или значениями по умолчанию
const typographySettings = reactive({
  font: existingSettings.value?.font || 'Georgia',
  fontSize: existingSettings.value?.fontSize || 16,
  lineHeight: existingSettings.value?.lineHeight || 1.5,
  letterSpacing: existingSettings.value?.letterSpacing || 0,
  wordSpacing: existingSettings.value?.wordSpacing || 0,
  textAlign: existingSettings.value?.textAlign || 'justify',
  marginTop: existingSettings.value?.marginTop || 20,
  marginBottom: existingSettings.value?.marginBottom || 20,
  paragraphIndent: existingSettings.value?.paragraphIndent || 20,
});

// Опции шрифтов
const fontOptions = [
  { label: 'Georgia', value: 'Georgia' },
  { label: 'Times New Roman', value: 'Times New Roman' },
  { label: 'Arial', value: 'Arial' },
  { label: 'Helvetica', value: 'Helvetica' },
  { label: 'Verdana', value: 'Verdana' },
  { label: 'Roboto', value: 'Roboto' },
];

// Опции выравнивания текста
const textAlignOptions = [
  { label: 'По левому краю', value: 'left' },
  { label: 'По центру', value: 'center' },
  { label: 'По правому краю', value: 'right' },
  { label: 'По ширине', value: 'justify' },
];

// Пример текста для предварительного просмотра
const sampleText = `Соображения высшего порядка, а также выбранный нами инновационный путь обеспечивает актуальность модели развития. Разнообразный и богатый опыт реализация намеченного плана развития требует от нас анализа дальнейших направлений развития проекта. Значимость этих проблем настолько очевидна, что постоянный количественный рост и сфера нашей активности представляет собой интересный эксперимент проверки всестороннего сбалансированных нововведений! С другой стороны социально-экономическое развитие требует от нас системного анализа всестороннего сбалансированного развития.

Разнообразный и богатый опыт консультация с профессионалами из IT способствует повышению актуальности модели развития. Разнообразный и богатый опыт реализация намеченного плана развития требует от нас анализа дальнейших направлений развития проекта. Значимость этих проблем настолько очевидна, что постоянный количественный рост и сфера нашей активности представляет собой интересный эксперимент проверки всестороннего сбалансированных нововведений!`;

// Вычисляемые стили для предварительного просмотра
const previewStyles = computed(() => ({
  fontFamily: typographySettings.font,
  fontSize: `${typographySettings.fontSize}px`,
  lineHeight: typographySettings.lineHeight,
  letterSpacing: `${typographySettings.letterSpacing}px`,
  wordSpacing: `${typographySettings.wordSpacing}px`,
  textAlign: typographySettings.textAlign,
  marginTop: `${typographySettings.marginTop}px`,
  marginBottom: `${typographySettings.marginBottom}px`,
  textIndent: `${typographySettings.paragraphIndent}px`,
}));

// Сохранение настроек
const saveSettings = async () => {
  try {
    await $fetch(`/api/book/${bookId}/typography`, {
      method: 'POST',
      body: typographySettings,
    });

    // Показать уведомление об успешном сохранении
    console.log('Настройки типографики сохранены');
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error);
  }
};

// Сброс к настройкам по умолчанию
const resetToDefaults = () => {
  Object.assign(typographySettings, {
    font: 'Georgia',
    fontSize: 16,
    lineHeight: 1.5,
    letterSpacing: 0,
    wordSpacing: 0,
    textAlign: 'justify',
    marginTop: 20,
    marginBottom: 20,
    paragraphIndent: 20,
  });
};
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb>
      <r-breadcrumb :options="ROUTES" />
    </template>

    <template #title>
      <r-header
        bottom="0"
        class="uppercase text-[#003386]"
      >
        Название главы
      </r-header>
    </template>

    <div class="typography-editor">
      <!-- Панель настроек -->
      <div class="settings-panel">
        <div class="settings-header">
          <h3 class="text-lg font-semibold text-[#003386] mb-4">Настройки</h3>
        </div>

        <div class="settings-grid">
          <!-- Шрифт -->
          <div class="setting-group">
            <label class="setting-label">Шрифт</label>
            <USelect
              v-model="typographySettings.font"
              :options="fontOptions"
              size="sm"
              class="setting-control"
            />
          </div>

          <!-- Размер шрифта -->
          <div class="setting-group">
            <label class="setting-label">Размер шрифта</label>
            <div class="flex items-center gap-2">
              <URange
                v-model="typographySettings.fontSize"
                :min="12"
                :max="24"
                :step="1"
                class="flex-1"
              />
              <span class="text-sm w-8"
                >{{ typographySettings.fontSize }}px</span
              >
            </div>
          </div>

          <!-- Высота строк -->
          <div class="setting-group">
            <label class="setting-label">Высота строк</label>
            <div class="flex items-center gap-2">
              <URange
                v-model="typographySettings.lineHeight"
                :min="1"
                :max="2.5"
                :step="0.1"
                class="flex-1"
              />
              <span class="text-sm w-8">{{
                typographySettings.lineHeight.toFixed(1)
              }}</span>
            </div>
          </div>

          <!-- Межстрочное расстояние -->
          <div class="setting-group">
            <label class="setting-label">Межстрочное расстояние</label>
            <div class="flex items-center gap-2">
              <URange
                v-model="typographySettings.letterSpacing"
                :min="-2"
                :max="5"
                :step="0.5"
                class="flex-1"
              />
              <span class="text-sm w-8"
                >{{ typographySettings.letterSpacing }}px</span
              >
            </div>
          </div>

          <!-- Ширина контейнера -->
          <div class="setting-group">
            <label class="setting-label">Ширина контейнера</label>
            <div class="flex items-center gap-2">
              <URange
                v-model="typographySettings.wordSpacing"
                :min="0"
                :max="10"
                :step="1"
                class="flex-1"
              />
              <span class="text-sm w-12"
                >{{ typographySettings.wordSpacing }}px</span
              >
            </div>
          </div>
        </div>

        <!-- Кнопки действий -->
        <div class="settings-actions">
          <UButton
            size="sm"
            class="bg-[#0862E0] hover:bg-[#0652C0] text-white rounded-[6px]"
            @click="saveSettings"
          >
            Опубликовать
          </UButton>

          <UButton
            variant="outline"
            size="sm"
            class="border-gray-300 text-gray-700 rounded-[6px]"
            @click="resetToDefaults"
          >
            Отмена
          </UButton>
        </div>
      </div>

      <!-- Предварительный просмотр -->
      <div class="preview-panel">
        <div class="preview-header">
          <UButton
            variant="ghost"
            size="sm"
            class="text-[#003386] hover:bg-blue-50"
          >
            Назад
          </UButton>
        </div>

        <div
          class="preview-content"
          :style="previewStyles"
        >
          <p
            v-for="(paragraph, index) in sampleText.split('\n\n')"
            :key="index"
            class="preview-paragraph"
          >
            {{ paragraph }}
          </p>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.typography-editor {
  display: flex;
  gap: 30px;
  padding: 30px 0;
  min-height: calc(100vh - 200px);
}

.settings-panel {
  width: 300px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 0px 4px 0px #59595940;
  height: fit-content;
  position: sticky;
  top: 30px;
}

.settings-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.setting-control {
  width: 100%;
}

.settings-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.preview-panel {
  flex: 1;
  background: white;
  border-radius: 10px;
  box-shadow: 0px 0px 4px 0px #59595940;
  overflow: hidden;
}

.preview-header {
  padding: 15px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.preview-content {
  padding: 40px;
  background: white;
  min-height: 600px;
}

.preview-paragraph {
  margin-bottom: 1em;

  &:last-child {
    margin-bottom: 0;
  }
}
</style>
