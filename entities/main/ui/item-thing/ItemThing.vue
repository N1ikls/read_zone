<script setup lang="ts">
import { RThing } from '@/components';
import type { Book } from '~/shared/types';

interface Props {
  item: Book;
  clickable?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  clickable: true,
});

const navigateToBook = () => {
  if (props.clickable && props.item?.id) {
    navigateTo(`/book/${props.item.id}`);
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (props.clickable && (event.key === 'Enter' || event.key === ' ')) {
    event.preventDefault();
    navigateToBook();
  }
};
</script>
<template>
  <div
    :class="[
      'item-thing-wrapper',
      {
        'item-thing-wrapper--clickable': clickable,
        'item-thing-wrapper--loading': !item?.id,
      },
    ]"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    :aria-label="
      clickable && item?.name ? `Перейти к книге ${item.name}` : undefined
    "
    @click="navigateToBook"
    @keydown="handleKeydown"
  >
    <r-thing>
      <template #avatar>
        <div class="avatar-wrapper">
          <img
            v-if="item?.background"
            :src="item.background"
            :alt="item?.name || 'Обложка книги'"
            loading="lazy"
            @error="$event.target.style.display = 'none'"
          />
          <div
            v-else
            class="avatar-placeholder"
            :aria-label="`Заглушка обложки для ${item?.name || 'книги'}`"
          >
            <svg
              class="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>
      </template>

      <span class="book-title">{{ item?.name || 'Загрузка...' }}</span>

      <template
        v-if="item?.genres && item.genres.length > 0"
        #content
      >
        <span
          v-for="(genre, index) in item.genres.slice(0, 3)"
          class="tag"
          :key="genre?.id || index"
        >
          {{ genre?.name }}
        </span>
        <span
          v-if="item.genres.length > 3"
          class="tag tag--more"
        >
          +{{ item.genres.length - 3 }}
        </span>
      </template>

      <template
        v-if="item?.rate && item.rate > 0"
        #extra
      >
        <div class="extra">
          <span class="rate-icon">
            <u-icon
              mode="svg"
              name="my-icons:rate"
              aria-hidden="true"
            />
          </span>
          <span
            class="rate-value"
            :aria-label="`Рейтинг ${item.rate.toFixed(1)} из 5`"
          >
            {{ item.rate.toFixed(1) }}
          </span>
        </div>
      </template>

      <template
        v-if="item?.description"
        #description
      >
        <p class="book-description">{{ item.description }}</p>
      </template>

      <template
        v-if="item?.actions"
        #actions
      >
        {{ item.actions }}
      </template>
    </r-thing>
  </div>
</template>

<style lang="scss" scoped>
.item-thing-wrapper {
  transition: all 0.2s ease-in-out;
  border-radius: 8px;

  &--clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

      .avatar-wrapper img {
        transform: scale(1.05);
      }

      .book-title {
        color: #0862e0;
      }
    }

    &:focus {
      outline: 2px solid #0862e0;
      outline-offset: 2px;
    }

    &:active {
      transform: translateY(0);
    }
  }

  &--loading {
    opacity: 0.7;
    pointer-events: none;

    .book-title {
      color: #9ca3af;
    }
  }
}

.avatar-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 5px;

  img {
    transition: transform 0.3s ease-in-out;
    width: 100px;
    height: 132px;
    object-fit: cover;
  }
}

.avatar-placeholder {
  width: 100px;
  height: 132px;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
}

.book-title {
  transition: color 0.2s ease-in-out;
  font-weight: 700;
  line-height: 1.2;
}

.book-description {
  margin: 0;
  line-height: 1.4;
  color: #6b7280;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tag {
  background-color: #97bfff;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out;

  &:hover {
    background-color: #7da3ff;
  }

  &--more {
    background-color: #e5e7eb;
    color: #6b7280;
  }
}

.extra {
  display: flex;
  align-items: center;
  gap: 4px;

  .rate-icon {
    display: flex;
    align-items: center;

    &:deep(path) {
      fill: #0862e0;
    }
  }

  .rate-value {
    font-weight: 600;
    color: #0862e0;
  }
}

// Accessibility improvements
@media (prefers-reduced-motion: reduce) {
  .item-thing-wrapper {
    transition: none;

    &--clickable:hover {
      transform: none;

      .avatar-wrapper img {
        transform: none;
      }
    }
  }

  .avatar-wrapper img {
    transition: none;
  }
}

// Loading state animation
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.item-thing-wrapper--loading {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
</style>
