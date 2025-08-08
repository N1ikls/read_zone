<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
});

const route = useRoute();
const chapterId = route.params.id as string;

// Загрузка данных главы
const { data: chapterData, refresh } = await useFetch(
  `/api/chapter/${chapterId}/content`,
);

if (!chapterData.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Глава не найдена',
  });
}

const ROUTES = [
  { label: 'Главная', to: '/' },
  { label: 'Профиль', to: '/profile' },
  { label: 'Мои работы', to: '/my-works' },
  { label: 'Главы', to: `/book/${chapterData.value.book_id}/edit` },
  { label: 'Редактор главы', to: `/chapter/${chapterId}/editor` },
];

// Состояние редактора
const editorState = reactive({
  name: chapterData.value.name || '',
  content: chapterData.value.content || '',
  status: chapterData.value.status || 'draft',
  is_public: chapterData.value.is_public || false,
  price: chapterData.value.price || 0,
  volume: chapterData.value.volume || '',
});

const isSaving = ref(false);
const hasChanges = ref(false);

// Отслеживание изменений
watch(
  editorState,
  () => {
    hasChanges.value = true;
  },
  { deep: true },
);

// Сохранение главы
const saveChapter = async () => {
  if (isSaving.value) return;

  isSaving.value = true;

  try {
    await $fetch(`/api/chapter/${chapterId}/content`, {
      method: 'POST',
      body: editorState,
    });

    hasChanges.value = false;

    // Показать уведомление об успешном сохранении
    console.log('Глава успешно сохранена');
  } catch (error) {
    console.error('Ошибка сохранения главы:', error);
  } finally {
    isSaving.value = false;
  }
};

// Автосохранение каждые 30 секунд
let autoSaveInterval: NodeJS.Timeout;

onMounted(() => {
  autoSaveInterval = setInterval(() => {
    if (hasChanges.value && !isSaving.value) {
      saveChapter();
    }
  }, 30000);
});

onUnmounted(() => {
  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
  }
});

// Предупреждение о несохраненных изменениях
onBeforeRouteLeave((to, from, next) => {
  if (hasChanges.value) {
    const answer = window.confirm(
      'У вас есть несохраненные изменения. Вы уверены, что хотите покинуть страницу?',
    );
    if (answer) {
      next();
    } else {
      next(false);
    }
  } else {
    next();
  }
});

// Опции статуса
const statusOptions = [
  { label: 'Черновик', value: 'draft' },
  { label: 'В процессе', value: 'progress' },
  { label: 'Опубликована', value: 'done' },
  { label: 'Заморожена', value: 'frozen' },
  { label: 'Отменена', value: 'discarded' },
];
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
        Редактор главы
      </r-header>
    </template>

    <div class="chapter-editor">
      <!-- Панель инструментов -->
      <div class="toolbar">
        <div class="toolbar-left">
          <UInput
            v-model="editorState.name"
            placeholder="Название главы"
            class="chapter-title-input"
            size="lg"
          />
        </div>

        <div class="toolbar-right">
          <UButton
            :loading="isSaving"
            :disabled="!hasChanges"
            class="bg-[#0862E0] hover:bg-[#0652C0] text-white rounded-[6px]"
            @click="saveChapter"
          >
            {{ isSaving ? 'Сохранение...' : 'Сохранить' }}
          </UButton>
        </div>
      </div>

      <!-- Основной редактор -->
      <div class="editor-container">
        <!-- Панель настроек -->
        <div class="settings-panel">
          <div class="settings-header">
            <h3 class="text-lg font-semibold text-[#003386] mb-4">
              Настройки главы
            </h3>
          </div>

          <div class="settings-grid">
            <!-- Статус -->
            <div class="setting-group">
              <label class="setting-label">Статус</label>
              <USelect
                v-model="editorState.status"
                :options="statusOptions"
                size="sm"
                class="setting-control"
              />
            </div>

            <!-- Публичность -->
            <div class="setting-group">
              <label class="setting-label">Доступность</label>
              <UToggle
                v-model="editorState.is_public"
                :ui="{ active: 'bg-[#0862E0]' }"
              />
              <span class="text-sm text-gray-600">
                {{ editorState.is_public ? 'Публичная' : 'Приватная' }}
              </span>
            </div>

            <!-- Цена (если приватная) -->
            <div
              v-if="!editorState.is_public"
              class="setting-group"
            >
              <label class="setting-label">Цена</label>
              <UInput
                v-model.number="editorState.price"
                type="number"
                min="0"
                size="sm"
                class="setting-control"
              />
            </div>

            <!-- Том -->
            <div class="setting-group">
              <label class="setting-label">Том</label>
              <UInput
                v-model="editorState.volume"
                placeholder="Название тома"
                size="sm"
                class="setting-control"
              />
            </div>
          </div>
        </div>

        <!-- Редактор содержимого -->
        <div class="content-editor">
          <div class="editor-header">
            <h4 class="text-md font-medium text-[#003386]">Содержимое главы</h4>
          </div>

          <UTextarea
            v-model="editorState.content"
            placeholder="Начните писать содержимое главы..."
            :rows="25"
            class="content-textarea"
            :ui="{
              base: 'w-full resize-none border-gray-200 focus:border-[#0862E0] focus:ring-[#0862E0] rounded-lg',
            }"
          />
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.chapter-editor {
  padding: 30px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0px 0px 4px 0px #59595940;
}

.toolbar-left {
  flex: 1;
  max-width: 400px;
}

.chapter-title-input {
  font-size: 18px;
  font-weight: 600;
}

.toolbar-right {
  display: flex;
  gap: 10px;
}

.editor-container {
  display: flex;
  gap: 30px;
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

.content-editor {
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0px 0px 4px 0px #59595940;
}

.editor-header {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.content-textarea {
  width: 100%;
  font-family: 'Georgia', serif;
  font-size: 16px;
  line-height: 1.6;
}
</style>
