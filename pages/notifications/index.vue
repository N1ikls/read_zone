
<template>
  <NuxtLayout name="default">
    <template #title>Уведомления</template>
    
    <div class="max-w-4xl mx-auto px-4 py-6">
      <!-- Заголовок и фильтры -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-2xl font-bold text-gray-900">Уведомления</h1>
          
          <div class="flex items-center space-x-3">
            <!-- Фильтр по статусу -->
            <select 
              v-model="filters.unread_only"
              @change="loadNotifications"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option :value="false">Все</option>
              <option :value="true">Только непрочитанные</option>
            </select>
            
            <!-- Фильтр по типу -->
            <select 
              v-model="filters.type"
              @change="loadNotifications"
              class="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="">Все типы</option>
              <option value="user_new_book">Новые книги</option>
              <option value="user_new_chapter">Новые главы</option>
              <option value="comment_reply">Ответы на комментарии</option>
              <option value="system_announcement">Объявления</option>
            </select>
            
            <!-- Кнопка "Прочитать все" -->
            <button
              v-if="unreadCount > 0"
              @click="markAllAsRead"
              class="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
            >
              Прочитать все ({{ unreadCount }})
            </button>
          </div>
        </div>
        
        <!-- Статистика -->
        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div class="text-2xl font-bold text-gray-900">{{ totalCount }}</div>
              <div class="text-sm text-gray-600">Всего уведомлений</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-blue-600">{{ unreadCount }}</div>
              <div class="text-sm text-gray-600">Непрочитанных</div>
            </div>
            <div>
              <div class="text-2xl font-bold text-green-600">{{ totalCount - unreadCount }}</div>
              <div class="text-sm text-gray-600">Прочитанных</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Список уведомлений -->
      <div v-if="loading" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-2 text-gray-600">Загрузка уведомлений...</p>
      </div>
      
      <div v-else-if="notifications.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Нет уведомлений</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ filters.unread_only ? 'Все уведомления прочитаны' : 'У вас пока нет уведомлений' }}
        </p>
      </div>
      
      <div v-else class="space-y-4">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          :class="{ 'border-l-4 border-l-blue-500 bg-blue-50': !notification.is_read }"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <!-- Заголовок и тип -->
              <div class="flex items-center space-x-2 mb-2">
                <span 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="getTypeClass(notification.type)"
                >
                  {{ getTypeLabel(notification.type) }}
                </span>
                <span 
                  v-if="!notification.is_read"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  Новое
                </span>
              </div>
              
              <!-- Заголовок -->
              <h3 class="text-lg font-medium text-gray-900 mb-2">
                {{ notification.title }}
              </h3>
              
              <!-- Сообщение -->
              <p class="text-gray-700 mb-3">
                {{ notification.message }}
              </p>
              
              <!-- Метаданные -->
              <div v-if="notification.metadata" class="text-sm text-gray-500 mb-3">
                <div v-if="notification.metadata.author_name" class="mb-1">
                  <span class="font-medium">Автор:</span> {{ notification.metadata.author_name }}
                </div>
                <div v-if="notification.metadata.book_title" class="mb-1">
                  <span class="font-medium">Книга:</span> {{ notification.metadata.book_title }}
                </div>
                <div v-if="notification.metadata.chapter_title" class="mb-1">
                  <span class="font-medium">Глава:</span> {{ notification.metadata.chapter_title }}
                </div>
              </div>
              
              <!-- Дата -->
              <p class="text-sm text-gray-500">
                {{ formatFullDate(notification.created_at) }}
              </p>
            </div>
            
            <!-- Действия -->
            <div class="flex items-center space-x-2 ml-4">
              <button
                v-if="!notification.is_read"
                @click="markAsRead(notification)"
                class="text-blue-600 hover:text-blue-800 text-sm"
                title="Пометить как прочитанное"
              >
                ✓
              </button>
              
              <button
                v-if="canNavigate(notification)"
                @click="navigateToContent(notification)"
                class="text-green-600 hover:text-green-800 text-sm"
                title="Перейти к контенту"
              >
                →
              </button>
              
              <button
                @click="deleteNotification(notification.id)"
                class="text-red-600 hover:text-red-800 text-sm"
                title="Удалить"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Пагинация -->
      <div v-if="pagination.pages > 1" class="mt-8 flex justify-center">
        <nav class="flex items-center space-x-2">
          <button
            v-for="page in visiblePages"
            :key="page"
            @click="changePage(page)"
            class="px-3 py-2 text-sm rounded-md"
            :class="page === pagination.page 
              ? 'bg-blue-600 text-white' 
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'"
          >
            {{ page }}
          </button>
        </nav>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Мета-данные страницы
definePageMeta({
  middleware: 'auth'
})

// Реактивные данные
const notifications = ref([])
const loading = ref(false)
const totalCount = ref(0)
const unreadCount = ref(0)
const pagination = ref({
  page: 1,
  limit: 20,
  pages: 1
})

const filters = ref({
  unread_only: false,
  type: ''
})

// Вычисляемые свойства
const visiblePages = computed(() => {
  const current = pagination.value.page
  const total = pagination.value.pages
  const pages = []
  
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i)
  }
  
  return pages
})

// Методы
const loadNotifications = async () => {
  try {
    loading.value = true
    
    const params = new URLSearchParams({
      page: pagination.value.page,
      limit: pagination.value.limit,
      unread_only: filters.value.unread_only,
      ...(filters.value.type && { type: filters.value.type })
    })
    
    const data = await $fetch(`/api/notifications?${params}`)
    
    notifications.value = data.notifications
    unreadCount.value = data.unread_count
    totalCount.value = data.pagination.total
    pagination.value = data.pagination
    
  } catch (error) {
    console.error('Ошибка загрузки уведомлений:', error)
  } finally {
    loading.value = false
  }
}

const markAllAsRead = async () => {
  try {
    await $fetch('/api/notifications/mark-read', {
      method: 'POST',
      body: { mark_all: true }
    })
    
    // Обновляем локальное состояние
    notifications.value.forEach(n => n.is_read = true)
    unreadCount.value = 0
    
  } catch (error) {
    console.error('Ошибка при пометке как прочитанное:', error)
  }
}

const markAsRead = async (notification) => {
  try {
    await $fetch('/api/notifications/mark-read', {
      method: 'POST',
      body: { notification_ids: [notification.id] }
    })
    
    notification.is_read = true
    unreadCount.value = Math.max(0, unreadCount.value - 1)
    
  } catch (error) {
    console.error('Ошибка при пометке как прочитанное:', error)
  }
}

const deleteNotification = async (notificationId) => {
  try {
    await $fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE'
    })
    
    // Удаляем из локального состояния
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      const notification = notifications.value[index]
      if (!notification.is_read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }
      notifications.value.splice(index, 1)
      totalCount.value--
    }
    
  } catch (error) {
    console.error('Ошибка при удалении уведомления:', error)
  }
}

const changePage = (page) => {
  pagination.value.page = page
  loadNotifications()
}

const canNavigate = (notification) => {
  return notification.related_entity_type && notification.related_entity_id
}

const navigateToContent = async (notification) => {
  if (!canNavigate(notification)) return
  
  const metadata = notification.metadata || {}
  
  if (notification.related_entity_type === 'book') {
    await navigateTo(`/book/${notification.related_entity_id}`)
  } else if (notification.related_entity_type === 'chapter' && metadata.book_id) {
    await navigateTo(`/book/${metadata.book_id}/chapter/${metadata.chapter_number || 1}`)
  }
  
  // Помечаем как прочитанное
  if (!notification.is_read) {
    await markAsRead(notification)
  }
}

// Утилиты
const getTypeLabel = (type) => {
  const labels = {
    'user_new_book': 'Новая книга',
    'user_new_chapter': 'Новая глава',
    'user_book_status': 'Статус книги',
    'book_new_chapter': 'Обновление закладки',
    'book_updated': 'Обновление книги',
    'comment_reply': 'Ответ на комментарий',
    'comment_on_content': 'Комментарий',
    'comment_liked': 'Лайк комментария',
    'system_announcement': 'Объявление',
    'system_moderation': 'Модерация',
    'system_maintenance': 'Техработы'
  }
  return labels[type] || type
}

const getTypeClass = (type) => {
  const classes = {
    'user_new_book': 'bg-green-100 text-green-800',
    'user_new_chapter': 'bg-blue-100 text-blue-800',
    'user_book_status': 'bg-yellow-100 text-yellow-800',
    'book_new_chapter': 'bg-purple-100 text-purple-800',
    'book_updated': 'bg-indigo-100 text-indigo-800',
    'comment_reply': 'bg-orange-100 text-orange-800',
    'comment_on_content': 'bg-pink-100 text-pink-800',
    'comment_liked': 'bg-red-100 text-red-800',
    'system_announcement': 'bg-gray-100 text-gray-800',
    'system_moderation': 'bg-red-100 text-red-800',
    'system_maintenance': 'bg-yellow-100 text-yellow-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const formatFullDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Загружаем данные при монтировании
onMounted(() => {
  loadNotifications()
})
</script>
