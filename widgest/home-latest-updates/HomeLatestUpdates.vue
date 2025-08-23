<script setup lang="ts">
import { computed, ref } from 'vue';

interface UpdateItem {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  last_update: string;
  last_chapter?: { title?: string; number?: number; created_at?: string };
  genres?: string[];
  stats?: {
    chapters_count?: number;
    likes_count?: number;
    views_count?: number;
    avg_rating?: number;
  };
}

const props = withDefaults(defineProps<{ initialLimit?: number }>(), {
  initialLimit: 4,
});

const limit = ref<number>(props.initialLimit);
const { data, refresh, pending, error } = useFetch<UpdateItem[]>(
  () => `/api/latest-updates`,
  {
    key: computed(() => `latest-updates:${limit.value}`),
    query: computed(() => ({ limit: limit.value })),
    server: false,
    default: () => [],
  },
);

const updates = computed(() => data.value || []);

const hasMore = computed(
  () => updates.value.length % 4 === 0 && updates.value.length >= limit.value,
);

const loadMore = async () => {
  limit.value += 4;
  await refresh();
};

// Форматирование «N минут назад»
const formatRelative = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  if (mins < 1) return 'только что';
  if (mins < 60) return `${mins} минут назад`;
  if (hours < 24) return `${hours} ч назад`;
  if (days < 7) return `${days} дн назад`;
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
};

const roundRating = (v?: number) =>
  typeof v === 'number' && !Number.isNaN(v) ? v.toFixed(2) : undefined;
</script>

<template>
  <section
    class="latest bg-white light:bg-[#FFFFFF] rounded-[10px] p-4 shadow-sm"
  >
    <r-header class="text-[#003386] mb-3">Последние обновления</r-header>

    <div
      v-if="error"
      class="error"
    >
      Не удалось загрузить данные
    </div>

    <div v-else>
      <div
        v-for="item in updates"
        :key="item.id"
        class="update-row"
      >
        <NuxtLink
          :to="`/book/${item.id}`"
          class="cover"
        >
          <img
            :src="item.cover"
            alt="cover"
            loading="lazy"
          />
        </NuxtLink>

        <div class="content">
          <NuxtLink
            :to="`/book/${item.id}`"
            class="title"
            >{{ item.title }}</NuxtLink
          >

          <div class="tags">
            <span
              v-for="(g, idx) in (item.genres || []).slice(0, 4)"
              :key="idx"
              class="tag"
              >{{ g }}</span
            >
          </div>

          <div class="meta">
            <div
              class="chapter"
              v-if="item.last_chapter"
            >
              Глава {{ item.last_chapter.number || '' }}
            </div>
          </div>
        </div>

        <div class="right">
          <div
            class="rating"
            v-if="roundRating(item.stats?.avg_rating)"
          >
            <UIcon
              name="my-icons:rate"
              class="star"
              mode="svg"
            />
            <span>{{ roundRating(item.stats?.avg_rating) }}</span>
          </div>
          <div class="time">{{ formatRelative(item.last_update) }}</div>
        </div>
      </div>

      <div class="mt-3">
        <UButton
          v-if="hasMore"
          color="info"
          size="lg"
          class="w-full font-bold rounded-[10px]"
          @click="loadMore"
          :loading="pending"
        >
          Показать еще
        </UButton>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.latest {
  .update-row {
    display: grid;
    grid-template-columns: 72px 1fr auto;
    gap: 10px;
    padding: 10px 6px;
    border-bottom: 1px solid #e5e7eb;

    &:last-child {
      border-bottom: 0;
    }
  }

  .cover {
    display: block;
    width: 72px;
    height: 96px;
    overflow: hidden;
    border-radius: 8px;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .title {
    font-weight: 700;
    color: #0f172a;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .tag {
    background: #eef5ff;
    color: #0f172a;
    padding: 2px 8px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
  }

  .meta {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .chapter {
    font-size: 12px;
    color: #6b7280;
  }
  .rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 600;
    color: #0f172a;
  }
  .star {
    color: #0862e0;
    font-size: 16px;
  }

  .right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: center;
    gap: 6px;
  }
  .time {
    white-space: nowrap;
    color: #6b7280;
    font-size: 12px;
  }

  .error {
    padding: 8px 12px;
    border: 1px solid #fecaca;
    background: #fef2f2;
    color: #b91c1c;
    border-radius: 8px;
  }
}
</style>
