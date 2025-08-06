<template>
  <NuxtLayout name="default">
    <template #title>Настройки уведомлений</template>
    
    <div class="max-w-2xl mx-auto px-4 py-6">
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <!-- Заголовок -->
        <div class="px-6 py-4 border-b border-gray-200">
          <h1 class="text-xl font-semibold text-gray-900">Настройки уведомлений</h1>
          <p class="mt-1 text-sm text-gray-600">
            Управляйте типами уведомлений, которые вы хотите получать
          </p>
        </div>

        <!-- Форма настроек -->
        <form @submit.prevent="saveSettings" class="p-6 space-y-6">
          <!-- Уведомления от авторов -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Подписки на авторов</h3>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="settings.user_new_book_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Новые книги</span>
                  <p class="text-sm text-gray-500">Уведомления о новых книгах от авторов, на которых вы подписаны</p>
                </div>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.user_new_chapter_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Новые главы</span>
                  <p class="text-sm text-gray-500">Уведомления о новых главах от авторов, на которых вы подписаны</p>
                </div>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.user_book_status_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Изменения статуса книг</span>
                  <p class="text-sm text-gray-500">Уведомления об изменении статуса книг (завершена, приостановлена и т.д.)</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Уведомления о закладках -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Закладки</h3>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="settings.book_new_chapter_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Новые главы в закладках</span>
                  <p class="text-sm text-gray-500">Уведомления о новых главах в книгах из ваших закладок</p>
                </div>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.book_updated_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Обновления книг</span>
                  <p class="text-sm text-gray-500">Уведомления об обновлениях книг из ваших закладок</p>
                </div>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.book_rating_changed_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Изменения рейтинга</span>
                  <p class="text-sm text-gray-500">Уведомления об изменении рейтинга книг из ваших закладок</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Уведомления о комментариях -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Комментарии</h3>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="settings.comment_reply_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Ответы на комментарии</span>
                  <p class="text-sm text-gray-500">Уведомления когда кто-то отвечает на ваши комментарии</p>
                </div>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.comment_on_content_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Комментарии к вашему контенту</span>
                  <p class="text-sm text-gray-500">Уведомления о новых комментариях к вашим книгам и главам</p>
                </div>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.comment_liked_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Лайки комментариев</span>
                  <p class="text-sm text-gray-500">Уведомления когда кому-то нравятся ваши комментарии</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Системные уведомления -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Системные уведомления</h3>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="settings.system_announcement_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Объявления</span>
                  <p class="text-sm text-gray-500">Важные объявления от администрации сайта</p>
                </div>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.system_moderation_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Модерация</span>
                  <p class="text-sm text-gray-500">Уведомления о модерации вашего контента</p>
                </div>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.system_maintenance_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Технические работы</span>
                  <p class="text-sm text-gray-500">Уведомления о плановых технических работах</p>
                </div>
              </label>
            </div>
          </div>

          <!-- Email уведомления -->
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Email уведомления</h3>
            <div class="space-y-3">
              <label class="flex items-center">
                <input
                  v-model="settings.email_notifications_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Email уведомления</span>
                  <p class="text-sm text-gray-500">Получать уведомления на электронную почту</p>
                </div>
              </label>
              
              <label class="flex items-center">
                <input
                  v-model="settings.email_digest_enabled"
                  type="checkbox"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  :disabled="!settings.email_notifications_enabled"
                >
                <div class="ml-3">
                  <span class="text-sm font-medium text-gray-900">Email дайджест</span>
                  <p class="text-sm text-gray-500">Получать сводку уведомлений на почту</p>
                </div>
              </label>
              
              <div v-if="settings.email_digest_enabled" class="ml-6">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Частота дайджеста
                </label>
                <select
                  v-model="settings.email_digest_frequency"
                  class="border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="daily">Ежедневно</option>
                  <option value="weekly">Еженедельно</option>
                  <option value="monthly">Ежемесячно</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="flex items-center justify-between pt-6 border-t border-gray-200">
            <button
              type="button"
              @click="resetToDefaults"
              class="text-sm text-gray-600 hover:text-gray-900"
            >
              Сбросить к настройкам по умолчанию
            </button>
            
            <div class="flex items-center space-x-3">
              <button
                type="button"
                @click="$router.back()"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Отмена
              </button>
              
              <button
                type="submit"
                :disabled="saving"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {{ saving ? 'Сохранение...' : 'Сохранить' }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Мета-данные страницы
definePageMeta({
  middleware: 'auth'
})

// Реактивные данные
const settings = ref({
  user_new_book_enabled: true,
  user_new_chapter_enabled: true,
  user_book_status_enabled: true,
  book_new_chapter_enabled: true,
  book_updated_enabled: true,
  book_rating_changed_enabled: false,
  comment_reply_enabled: true,
  comment_on_content_enabled: true,
  comment_liked_enabled: false,
  system_moderation_enabled: true,
  system_announcement_enabled: true,
  system_maintenance_enabled: true,
  email_notifications_enabled: false,
  email_digest_enabled: false,
  email_digest_frequency: 'weekly'
})

const saving = ref(false)
const originalSettings = ref({})

// Методы
const loadSettings = async () => {
  try {
    const data = await $fetch('/api/notifications/settings')
    settings.value = { ...data.settings }
    originalSettings.value = { ...data.settings }
  } catch (error) {
    console.error('Ошибка загрузки настроек:', error)
  }
}

const saveSettings = async () => {
  try {
    saving.value = true
    
    await $fetch('/api/notifications/settings', {
      method: 'POST',
      body: settings.value
    })
    
    // Показываем уведомление об успехе
    // TODO: Добавить toast уведомление
    console.log('Настройки сохранены')
    
    // Обновляем оригинальные настройки
    originalSettings.value = { ...settings.value }
    
  } catch (error) {
    console.error('Ошибка сохранения настроек:', error)
    // TODO: Показать ошибку пользователю
  } finally {
    saving.value = false
  }
}

const resetToDefaults = () => {
  settings.value = {
    user_new_book_enabled: true,
    user_new_chapter_enabled: true,
    user_book_status_enabled: true,
    book_new_chapter_enabled: true,
    book_updated_enabled: true,
    book_rating_changed_enabled: false,
    comment_reply_enabled: true,
    comment_on_content_enabled: true,
    comment_liked_enabled: false,
    system_moderation_enabled: true,
    system_announcement_enabled: true,
    system_maintenance_enabled: true,
    email_notifications_enabled: false,
    email_digest_enabled: false,
    email_digest_frequency: 'weekly'
  }
}

// Загружаем настройки при монтировании
onMounted(() => {
  loadSettings()
})
</script>
