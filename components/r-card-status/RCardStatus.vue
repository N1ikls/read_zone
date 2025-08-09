<script setup lang="ts">
interface Genre {
  id: number;
  name: string;
}

interface BookItem {
  id: string | number;
  bookmark_type?: string;
  genres?: Genre[];
  [key: string]: any;
}

const { item } = defineProps<{
  item: BookItem;
}>();

// Функция для перехода к управлению главами
const navigateToEditor = () => {
  navigateTo(`/book/${item.id}/edit`);
};
</script>

<template>
  <div class="w-full">
    <div class="flex items-center justify-end gap-2">
      <div
        class="type w-30 text-center p-5 pt-[6px] pb-[6px] bg-[#0048B8] text-[#FFFFFF] rounded-[6px] font-normal text-sm flex items-center justify-center"
      >
        <slot name="status" />
      </div>

      <u-button
        v-if="item.is_writeable"
        variant="ghost"
        size="xs"
        class="edit-btn w-6 h-6 p-0 flex items-center justify-center rounded-[6px] border border-[#97BFFF] bg-[#FFFFFF] hover:bg-[#F2F9FF]"
        @click.stop="navigateToEditor"
      >
        <u-icon
          name="my-icons:edit-pencil"
          class="w-4 h-4"
        />
      </u-button>
    </div>
    <div class="item-card">
      <r-thing>
        <template #avatar>
          <img
            class="avatar"
            src="../../public/catalog.jpg"
          />
        </template>

        <span class="item-card__title"> {{ item?.name }}</span>

        <template #content>
          <div class="w-full flex flex-col gap-4">
            <div class="item-card__content w-full">
              <div class="item-card__content-extra">
                <u-icon
                  mode="svg"
                  class="timer"
                  name="my-icons:timer"
                />

                <span class="genre">{{ item.year }}</span>
              </div>

              <div class="item-card__content-extra">
                <u-icon
                  mode="svg"
                  name="my-icons:eyes-black"
                />

                <span class="genre">{{ item.viewers_count }}</span>
              </div>

              <div class="item-card__content-extra">
                <u-icon
                  mode="svg"
                  name="my-icons:read"
                />

                <span class="genre">{{ item.chapters_count }}</span>
              </div>

              <div class="item-card__content-extra">
                <u-icon
                  mode="svg"
                  name="my-icons:like-black"
                />

                <span class="genre">{{ item.likers_count }}</span>
              </div>
            </div>

            <div class="flex gap-6">
              <div
                v-for="(genre, index) in item.genres"
                :key="index"
                class="tag bg-[#F2F9FF] rounded-[4px] text-[#000000] font-normal text-xs"
              >
                {{ genre.name }}
              </div>
            </div>
          </div>
        </template>

        <template
          v-if="item.description"
          #description
        >
          <span class="description">
            {{ item.description }}
          </span>
        </template>

        <template #extra>
          <div class="flex items-center gap-3">
            <!-- Рейтинг -->
            <div
              v-if="item.rate"
              class="extra rate"
            >
              <u-icon
                mode="svg"
                name="my-icons:rate"
              />

              <div class="text-[#131313] text-lg font-semibold">
                {{ item.rate }}
              </div>
            </div>
          </div>
        </template>
      </r-thing>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.extra {
  display: flex;
  align-items: center;
  gap: 3px;
}

.tag {
  padding: 6px 24px;
}

.genre {
  font-size: 14px;
  font-weight: 400;
  color: #000000;
}

.rate {
  :deep(path) {
    fill: #0862e0;
  }
}

.timer {
  :deep(path) {
    stroke: #000000;
    stroke-width: 1px;
  }
}

.item-card {
  padding: 20px;
  background: #ffffff;
  box-shadow: 0px 0px 4px 0px #59595940;
  border-radius: 10px;
  margin-bottom: 16px;
  cursor: pointer;

  &:hover {
    box-shadow: 0 0px 12px rgba(0, 0, 0, 0.1);
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    word-break: break-all;
    overflow-wrap: break-word;
  }

  &__content {
    display: flex;
    align-items: center;
    gap: 20px;

    &-extra {
      display: flex;
      align-items: center;
      gap: 10px;

      svg {
        font-size: 22px;
      }
    }
  }

  .avatar {
    width: 153px;
    height: 153px;
    border-radius: 10px;
    object-fit: cover;
  }

  .description {
    color: #000000;
    font-size: 12px;
    font-weight: 300;
    vertical-align: middle;
  }

  .text-tag {
    padding: 3px 10px;
    border-radius: 10px;
    margin-right: 4px;
    color: #000000;
    font-size: 14px;
    font-weight: 500;
  }
}
</style>
