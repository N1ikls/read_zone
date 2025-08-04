<template>
  <div class="book-novelties">
    <!-- Заголовок секции -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 mb-2">Новинки недели</h2>
        <p class="text-sm text-gray-600">
          Свежие книги за последние 7 дней
          <span v-if="rotationInfo.isRotating" class="ml-2">
            • Обновление через {{ formatTime(rotationInfo.nextRotationIn) }}
          </span>
        </p>
      </div>
      
      <!-- Кнопки управления -->
      <div class="flex items-center space-x-2">
        <button
          v-if="rotationInfo.isRotating"
          @click="showPrevious"
          :disabled="loading"
          class="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          title="Предыдущие"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button
          @click="showNext"
          :disabled="loading"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Загрузка...' : 'Показать еще' }}
        </button>
        
        <button
          v-if="rotationInfo.isRotating"
          @click="showNext"
          :disabled="loading"
          class="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          title="Следующие"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Индикатор ротации -->
    <div v-if="rotationInfo.isRotating" class="mb-4">
      <div class="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>Страница {{ rotationInfo.currentPage }} из {{ rotationInfo.totalPages }}</span>
        <span>{{ books.length }} из {{ totalBooks }} книг</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-1">
        <div 
          class="bg-blue-600 h-1 rounded-full transition-all duration-300"
          :style="{ width: `${(rotationInfo.currentPage / rotationInfo.totalPages) * 100}%` }"
        ></div>
      </div>
    </div>

    <!-- Сетка книг -->
    <div v-if="loading && books.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <!-- Скелетоны загрузки -->
      <div v-for="i in 6" :key="i" class="animate-pulse">
        <div class="bg-gray-200 aspect-[3/4] rounded-lg mb-3"></div>
        <div class="h-4 bg-gray-200 rounded mb-2"></div>
        <div class="h-3 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>

    <div v-else-if="books.length === 0" class="text-center py-12">
      <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Новинок пока нет</h3>
      <p class="text-gray-500">За последнюю неделю новых книг не появилось</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div
        v-for="book in books"
        :key="book.id"
        class="group cursor-pointer transform transition-all duration-200 hover:scale-105"
        @click="navigateToBook(book)"
      >
        <!-- Обложка книги -->
        <div class="relative aspect-[3/4] rounded-lg overflow-hidden mb-3 bg-gray-100">
          <img
            v-if="book.cover"
            :src="book.cover"
            :alt="book.name"
            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            loading="lazy"
          />
          <div v-else class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
            <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          
          <!-- Бейдж "Новинка" -->
          <div class="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            Новинка
          </div>
          
          <!-- Статус книги -->
          <div class="absolute top-2 right-2">
            <span 
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              :class="getStatusClass(book.status)"
            >
              {{ getStatusLabel(book.status) }}
            </span>
          </div>
        </div>

        <!-- Информация о книге -->
        <div class="space-y-1">
          <h3 class="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {{ book.name }}
          </h3>
          
          <p class="text-sm text-gray-600">
            {{ book.author_name }}
          </p>
          
          <div class="flex items-center justify-between text-xs text-gray-500">
            <span>{{ formatDate(book.created_at) }}</span>
            <div class="flex items-center space-x-2">
              <span v-if="book.chapters_count">{{ book.chapters_count }} гл.</span>
              <span v-if="book.rate" class="flex items-center">
                <svg class="w-3 h-3 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {{ book.rate.toFixed(1) }}
              </span>
            </div>
          </div>
          
          <!-- Жанры -->
          <div v-if="book.genres && book.genres.length" class="flex flex-wrap gap-1 mt-2">
            <span
              v-for="genre in book.genres.slice(0, 3)"
              :key="genre.id"
              class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
            >
              {{ genre.name }}
            </span>
            <span v-if="book.genres.length > 3" class="text-xs text-gray-500">
              +{{ book.genres.length - 3 }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Информация о следующем обновлении -->
    <div v-if="rotationInfo.isRotating && !loading" class="mt-6 text-center">
      <p class="text-sm text-gray-500">
        Автоматическое обновление каждые {{ rotationInfo.rotationIntervalMinutes }} минут
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Пропсы
const props = defineProps({
  limit: {
    type: Number,
    default: 6
  },
  autoRotate: {
    type: Boolean,
    default: true
  }
})

// Реактивные данные
const books = ref([])
const loading = ref(false)
const totalBooks = ref(0)
const currentOffset = ref(0)
const rotationInfo = ref({
  isRotating: false,
  currentPage: 1,
  totalPages: 1,
  nextRotationIn: 0,
  rotationIntervalMinutes: 5
})

let rotationTimer = null
let countdownTimer = null

// Методы
const loadNovelties = async (offset = null, manual = false) => {
  try {
    loading.value = true
    
    const params = new URLSearchParams({
      limit: props.limit.toString()
    })
    
    if (offset !== null) {
      params.append('offset', offset.toString())
    }
    
    if (manual) {
      params.append('manual', 'true')
    }
    
    const response = await $fetch(`/api/books/novelties?${params}`)
    
    if (response.success) {
      books.value = response.data.books
      totalBooks.value = response.data.total
      currentOffset.value = response.data.offset
      rotationInfo.value = response.meta.rotation
      
      // Запускаем обратный отсчет
      startCountdown()
    }
  } catch (error) {
    console.error('Ошибка загрузки новинок:', error)
  } finally {
    loading.value = false
  }
}

const showNext = () => {
  const nextOffset = rotationInfo.value.isRotating 
    ? (currentOffset.value + props.limit) % totalBooks.value
    : currentOffset.value + props.limit
    
  loadNovelties(nextOffset, true)
}

const showPrevious = () => {
  let prevOffset = currentOffset.value - props.limit
  if (prevOffset < 0) {
    prevOffset = Math.max(0, totalBooks.value - props.limit)
  }
  loadNovelties(prevOffset, true)
}

const navigateToBook = (book) => {
  navigateTo(`/book/${book.id}`)
}

const startCountdown = () => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  if (!props.autoRotate || !rotationInfo.value.isRotating) return
  
  countdownTimer = setInterval(() => {
    if (rotationInfo.value.nextRotationIn > 0) {
      rotationInfo.value.nextRotationIn--
    } else {
      // Время для автоматического обновления
      loadNovelties()
    }
  }, 1000)
}

const setupAutoRotation = () => {
  if (!props.autoRotate) return
  
  if (rotationTimer) {
    clearInterval(rotationTimer)
  }
  
  // Проверяем обновления каждую минуту
  rotationTimer = setInterval(() => {
    if (!loading.value) {
      loadNovelties()
    }
  }, 60000)
}

// Утилиты
const formatTime = (seconds) => {
  if (seconds < 60) return `${seconds}с`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}м ${remainingSeconds}с`
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Сегодня'
  if (diffDays === 1) return 'Вчера'
  if (diffDays < 7) return `${diffDays} дн. назад`
  
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short'
  })
}

const getStatusLabel = (status) => {
  const labels = {
    'progress': 'В процессе',
    'done': 'Завершена',
    'frozen': 'Заморожена',
    'discarded': 'Отменена'
  }
  return labels[status] || status
}

const getStatusClass = (status) => {
  const classes = {
    'progress': 'bg-blue-100 text-blue-800',
    'done': 'bg-green-100 text-green-800',
    'frozen': 'bg-yellow-100 text-yellow-800',
    'discarded': 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Жизненный цикл
onMounted(() => {
  loadNovelties()
  setupAutoRotation()
})

onUnmounted(() => {
  if (rotationTimer) {
    clearInterval(rotationTimer)
  }
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
