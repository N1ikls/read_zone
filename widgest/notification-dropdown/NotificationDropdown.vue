<template>
  <div class="relative">
    <!-- Кнопка уведомлений -->
    <button
      @click="toggleDropdown"
      class="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg"
      :class="{ 'text-blue-600': isOpen }"
    >
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>

      <!-- Счетчик непрочитанных -->
      <span
        v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
      >
        {{ unreadCount > 99 ? '99+' : unreadCount }}
      </span>
    </button>

    <!-- Выпадающее меню -->
    <div
      v-if="isOpen"
      class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
      @click.stop
    >
      <!-- Заголовок -->
      <div
        class="px-4 py-3 border-b border-gray-200 flex items-center justify-between"
      >
        <h3 class="text-lg font-semibold text-gray-900">Уведомления</h3>
        <div class="flex items-center space-x-2">
          <button
            v-if="unreadCount > 0"
            @click="markAllAsRead"
            class="text-sm text-blue-600 hover:text-blue-800"
          >
            Прочитать все
          </button>
          <button
            @click="goToSettings"
            class="text-gray-400 hover:text-gray-600"
            title="Настройки"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Список уведомлений -->
      <div class="max-h-96 overflow-y-auto">
        <div
          v-if="loading"
          class="p-4 text-center text-gray-500"
        >
          Загрузка...
        </div>

        <div
          v-else-if="notifications.length === 0"
          class="p-4 text-center text-gray-500"
        >
          Нет уведомлений
        </div>

        <div v-else>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
            :class="{ 'bg-blue-50': !notification.is_read }"
            @click="handleNotificationClick(notification)"
          >
            <div class="flex items-start space-x-3">
              <!-- Иконка типа уведомления -->
              <div class="flex-shrink-0 mt-1">
                <div
                  class="w-2 h-2 rounded-full"
                  :class="notification.is_read ? 'bg-gray-300' : 'bg-blue-500'"
                ></div>
              </div>

              <!-- Содержимое уведомления -->
              <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 truncate">
                  {{ notification.title }}
                </p>
                <p class="text-sm text-gray-600 mt-1 line-clamp-2">
                  {{ notification.message }}
                </p>
                <p class="text-xs text-gray-400 mt-1">
                  {{ formatDate(notification.created_at) }}
                </p>
              </div>

              <!-- Кнопка удаления -->
              <button
                @click.stop="deleteNotification(notification.id)"
                class="flex-shrink-0 text-gray-400 hover:text-red-500 p-1"
                title="Удалить"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Футер -->
      <div class="px-4 py-3 border-t border-gray-200 text-center">
        <NuxtLink
          to="/notifications"
          class="text-sm text-blue-600 hover:text-blue-800"
          @click="closeDropdown"
        >
          Показать все уведомления
        </NuxtLink>
      </div>
    </div>

    <!-- Overlay для закрытия -->
    <div
      v-if="isOpen"
      class="fixed inset-0 z-40"
      @click="closeDropdown"
    ></div>
  </div>
</template>

<script setup>
const isOpen = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
const loading = ref(false);

// Методы
const toggleDropdown = async () => {
  isOpen.value = !isOpen.value;
};

const closeDropdown = () => {
  isOpen.value = false;
};

// Получаем информацию о пользователе
let user = ref(null);
try {
  const userData = await $fetch('/api/auth/me');
  user.value = userData;
} catch (error) {
  console.log('User not authenticated');
}

// Загружаем уведомления только если пользователь авторизован
if (user.value) {
  await useAsyncData('notifications', async () => {
    try {
      const notification = await $fetch('/api/notifications', {
        method: 'get',
        query: {
          limit: 10,
        },
      });

      if (!notification) return null;
      notifications.value = notification.notifications;
      unreadCount.value = notification.unread_count;

      return notification;
    } catch (error) {
      // Если ошибка авторизации, просто не загружаем уведомления
      if (error.statusCode === 401) {
        console.log('User not authorized for notifications');
        return null;
      }
      throw error;
    }
  });
}

const markAllAsRead = async () => {
  if (!user.value) return;

  try {
    await $fetch('/api/notifications/mark-read', {
      method: 'POST',
      body: { mark_all: true },
    });

    // Обновляем локальное состояние
    notifications.value.forEach((n) => (n.is_read = true));
    unreadCount.value = 0;
  } catch (error) {
    console.error('Ошибка при пометке как прочитанное:', error);
  }
};

const handleNotificationClick = async (notification) => {
  // Помечаем как прочитанное если не прочитано
  if (!notification.is_read && user.value) {
    try {
      await $fetch('/api/notifications/mark-read', {
        method: 'POST',
        body: { notification_ids: [notification.id] },
      });

      notification.is_read = true;
      unreadCount.value = Math.max(0, unreadCount.value - 1);
    } catch (error) {
      console.error('Ошибка при пометке как прочитанное:', error);
    }
  }

  // Переходим к связанному контенту если есть
  if (notification.related_entity_type && notification.related_entity_id) {
    const metadata = notification.metadata || {};

    if (notification.related_entity_type === 'book') {
      await navigateTo(`/book/${notification.related_entity_id}`);
    } else if (
      notification.related_entity_type === 'chapter' &&
      metadata.book_id
    ) {
      await navigateTo(
        `/book/${metadata.book_id}/chapter/${metadata.chapter_number || 1}`,
      );
    }
  }

  closeDropdown();
};

const deleteNotification = async (notificationId) => {
  if (!user.value) return;

  try {
    await $fetch(`/api/notifications/${notificationId}`, {
      method: 'DELETE',
    });

    // Удаляем из локального состояния
    const index = notifications.value.findIndex((n) => n.id === notificationId);
    if (index !== -1) {
      const notification = notifications.value[index];
      if (!notification.is_read) {
        unreadCount.value = Math.max(0, unreadCount.value - 1);
      }
      notifications.value.splice(index, 1);
    }
  } catch (error) {
    console.error('Ошибка при удалении уведомления:', error);
  }
};

const goToSettings = () => {
  navigateTo('/notifications/settings');
  closeDropdown();
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'только что';
  if (diffMins < 60) return `${diffMins} мин назад`;
  if (diffHours < 24) return `${diffHours} ч назад`;
  if (diffDays < 7) return `${diffDays} дн назад`;

  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
};

// Закрываем при нажатии Escape
const handleEscape = (e) => {
  if (e.key === 'Escape') {
    closeDropdown();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
