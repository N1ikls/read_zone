<script setup lang="ts">
import { computed, ref } from 'vue';

interface AuthorItem {
  id: string;
  name: string;
  avatar?: string;
  books_count?: number;
  chapters_in_month?: number;
  likers_count?: number;
  subscribers_count?: number;
  avg_rating?: number;
}

const props = withDefaults(defineProps<{ limit?: number }>(), { limit: 10 });

const { data, pending, error } = useFetch<AuthorItem[]>(
  () => '/api/top-authors',
  {
    key: computed(() => `top-authors:${props.limit}`),
    query: computed(() => ({ limit: props.limit })),
    server: false,
    default: () => [],
  },
);

const authors = computed(() => data.value || []);
const defaultAvatar = '/head.png';
</script>

<template>
  <aside
    class="top-authors bg-white light:bg-[#FFFFFF] rounded-[10px] p-4 shadow-sm"
  >
    <r-header class="text-[#003386] mb-3">Топ авторов</r-header>

    <div
      v-if="error"
      class="error"
    >
      Не удалось загрузить топ авторов
    </div>

    <div v-else>
      <div
        v-if="pending"
        class="list"
      >
        <USkeleton
          v-for="n in 6"
          :key="n"
          class="h-[56px] rounded"
        />
      </div>

      <div
        v-else
        class="list"
      >
        <div
          v-if="authors.length === 0"
          class="empty"
        >
          Нет данных для отображения
        </div>

        <div
          v-for="(a, idx) in authors"
          :key="a.id || idx"
          class="row"
        >
          <div class="place">
            <span class="num">#{{ idx + 1 }}</span>
          </div>

          <UAvatar
            :src="a.avatar || defaultAvatar"
            size="lg"
            class="avatar"
          />

          <div class="info">
            <div class="name">{{ a.name }}</div>
            <div class="stats">
              <span class="stat">{{ a.subscribers_count || 0 }} подписок</span>
              <span class="dot" />
              <span class="stat">{{ a.likers_count || 0 }} лайков</span>
            </div>
          </div>

          <div
            class="rating"
            v-if="typeof a.avg_rating === 'number' && a.avg_rating > 0"
          >
            <UIcon
              name="my-icons:rate"
              class="star"
              mode="svg"
            />
            <span>{{ Number(a.avg_rating).toFixed(2) }}</span>
          </div>
        </div>

        <div class="mt-3">
          <NuxtLink
            to="/workshop"
            class="w-full block"
          >
            <UButton
              color="info"
              size="lg"
              class="w-full font-bold rounded-[10px]"
              >Посмотреть всех авторов</UButton
            >
          </NuxtLink>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.top-authors {
  .list {
    display: grid;
    gap: 8px;
  }
  .row {
    display: grid;
    grid-template-columns: 28px 48px 1fr auto;
    gap: 8px;
    align-items: center;
    padding: 6px 4px;
    border-bottom: 1px solid #e5e7eb;
    &:last-child {
      border-bottom: 0;
    }
  }
  .place {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .num {
    color: #0862e0;
    font-weight: 700;
  }
  .avatar {
    border-radius: 50%;
  }
  .name {
    font-weight: 700;
    color: #0f172a;
  }
  .stats {
    color: #6b7280;
    font-size: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .dot {
    width: 4px;
    height: 4px;
    background: #cbd5e1;
    border-radius: 50%;
    display: inline-block;
  }
  .rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-weight: 700;
    color: #0f172a;
  }
  .star {
    color: #0862e0;
    font-size: 18px;
  }
  .error {
    padding: 8px 12px;
    border: 1px solid #fecaca;
    background: #fef2f2;
    color: #b91c1c;
    border-radius: 8px;
  }
  .empty {
    padding: 8px 12px;
    color: #6b7280;
  }
}
</style>
