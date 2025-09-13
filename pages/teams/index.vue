<script setup lang="ts">
import numeral from 'numeral';
import { WORK_BY_FORMAT, TEAM_BY_SIZE, PLATFORM_BY } from './consts';
import { debounce } from 'es-toolkit';
import { isEmpty } from 'es-toolkit/compat';

const route = useRoute();
const setRouteQueries = useSetRouteQuery();
const queries = useGetRouteQuery({
  search: null,
  page: 1,
  limit: 10,
});

const search = ref('');
const debounceParsedQueries = ref(unref(queries));

const ROUTES = [
  { label: 'Главная', to: '/' },
  { label: 'Сообщество', to: '/catalog' },
  { label: 'Команды' },
];

const { data } = await useFetch('/api/teams', {
  key: 'teams-list',
  method: 'get',
  query: debounceParsedQueries,
  default: () => ({ teams: [], total: 0 }),
});

const handlePageChange = (page: number) => {
  setRouteQueries({ page: page.toString() });
};

const onUpdateName = (value: string) => {
  setRouteQueries(resetPaginationQuery({ search: value }));
};

const onSortDesc = (value: string) => {
  setRouteQueries(resetPaginationQuery({ sort: value }));
};

watch(search, (value) => onUpdateName(value));

watch(
  queries,
  debounce((newValue) => {
    debounceParsedQueries.value = newValue;
  }, 1000),
);
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb>
      <r-breadcrumb :options="ROUTES" />
    </template>

    <template #title> Команды </template>

    <div class="flex gap-4 items-center mb-4">
      <UInput
        v-model="search"
        icon="i-lucide-search"
        size="md"
        :ui="{
          root: 'w-full mt-1',
          base: 'bg-[#F5F5F5] rounded-[10px]  h-9 placeholder:text-[#C2C2C2] placeholder:italic placeholder-text-base',
          trailing: 'pe-1',
        }"
        variant="soft"
        placeholder="Найти по названию команды"
      >
        <template
          v-if="search"
          #trailing
        >
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            icon="i-lucide-circle-x"
            aria-label="Clear input"
            @click="search = ''"
          />
        </template>
      </UInput>

      <u-button
        color="secondary"
        class="rounded-[10px] flex items-center justify-center h-[37px] w-[40.52px]"
      >
        <u-icon
          mode="svg"
          name="my-icons:sorter-low"
        />
      </u-button>

      <u-button
        color="secondary"
        class="rounded-[10px] flex items-center justify-center h-[37px] w-[40.52px]"
      >
        <u-icon
          mode="svg"
          name="my-icons:sorter-up"
        />
      </u-button>
    </div>

    <div class="flex gap-4">
      <div class="sidebar w-[250px] flex flex-col gap-6">
        <div class="sidebar__item">
          <div class="text-[14px] mb-4">По формату работ</div>

          <div class="grid gap-2">
            <u-button
              v-for="item in WORK_BY_FORMAT"
              :key="item.link"
              color="secondary"
              block
              class="text-[#000000]"
            >
              {{ item.name }}
            </u-button>
          </div>
        </div>

        <div class="sidebar__item">
          <div class="text-[14px] mb-4">По размеру команды</div>

          <div class="grid gap-2">
            <u-button
              v-for="item in TEAM_BY_SIZE"
              :key="item.link"
              color="secondary"
              block
              class="text-[#000000]"
            >
              {{ item.name }}
            </u-button>
          </div>
        </div>

        <div class="sidebar__item">
          <div class="text-[14px] mb-4">По платформам</div>

          <div class="grid gap-2">
            <u-button
              v-for="item in PLATFORM_BY"
              :key="item.link"
              color="secondary"
              block
              class="text-[#000000]"
            >
              {{ item.name }}
            </u-button>
          </div>
        </div>
      </div>

      <div class="flex flex-col flex-1 gap-4 items-center">
        <div class="flex flex-col flex-1 gap-4">
          <nuxt-link
            v-for="team in data.items.teams"
            :key="team.id"
            :to="`teams/${team.id}`"
            class="list grid grid-cols-[1fr_180px] gap-2"
          >
            <div class="bg-[var(--bg-card)] list__card rounded-[10px] p-4">
              <r-thing clamp="6">
                <template #avatar>
                  <span
                    class="relative inline-flex shrink-0 aspect-[2/3] overflow-hidden rounded-sm select-none w-20 md:w-24 lg:w-37"
                  >
                    <NuxtImg
                      style="
                        position: absolute;
                        height: 100%;
                        width: 100%;
                        inset: 0px;
                        color: transparent;
                      "
                      placeholder
                      class="select-none size-full object-cover transition-all duration-200"
                      :src="team.avatar || '/test_banner_2.png'"
                      :alt="team.name"
                    />
                  </span>
                </template>

                <span
                  class="item-card__title"
                  :class="{ 'text-[#FFFFFF]': team.background }"
                >
                  {{ team?.name }}
                </span>

                <template #text>
                  <span
                    class="text-[15px]"
                    :class="{ 'text-[#FFFFFF]': team.background }"
                  >
                    Участники: Аноним</span
                  >
                </template>

                <template #content>
                  <div
                    class="light:bg-[#FFFFFF] px-[6px] py-[8px] rounded-[10px] flex gap-1 items-center"
                  >
                    <icon
                      name="my-icons:people"
                      class="text-[20px]"
                      mode="svg"
                    />

                    <span class="text-[12px]">
                      {{
                        numeral(team?.teammates_count)
                          .format('0.[0]a')
                          .toUpperCase()
                      }}
                    </span>
                  </div>

                  <div
                    class="light:bg-[#FFFFFF] px-[6px] py-[8px] rounded-[10px] flex gap-1 items-center"
                  >
                    <icon
                      name="my-icons:like"
                      class="text-[20px]"
                      mode="svg"
                    />

                    <span class="text-[12px]">
                      {{
                        numeral(team?.likers_count)
                          .format('0.[0]a')
                          .toUpperCase()
                      }}
                    </span>
                  </div>

                  <div
                    class="light:bg-[#FFFFFF] px-[6px] py-[8px] rounded-[10px] flex gap-1 items-center"
                  >
                    <icon
                      name="my-icons:read-board"
                      class="text-[20px] stroke-[1.5px]"
                      mode="svg"
                    />

                    <span class="text-[12px]">
                      {{
                        numeral(team?.subscribers_count)
                          .format('0.[0]a')
                          .toUpperCase()
                      }}</span
                    >
                  </div>
                </template>

                <template #description>
                  <div
                    class="p-[6px] bg-white/30 backdrop-blur-fallback rounded-[10px]"
                    :class="{ 'text-[#FFFFFF]': team.background }"
                  >
                    {{ team?.description }}
                  </div>
                </template>
              </r-thing>
            </div>

            <div
              class="bg-[#222222] rounded-[10px] flex items-center justify-center h-full w-full"
            >
              <img
                class="z-10 object-cover w-[150px]"
                src="../../public/teams-flag.png"
              />
            </div>
          </nuxt-link>
        </div>

        <r-pagination
          v-if="!isEmpty(data.items.teams)"
          :page="Number(queries?.page)"
          :limit="Number(queries?.limit)"
          :total="Number(data.items?.total)"
          @update-page="handlePageChange"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
:deep(.r-thing-header-wrapper) {
  justify-content: inherit;
}
:deep(.r-thing__header-content) {
  margin-top: 6px;
}
.list {
  &__card {
    background-position: 50% 50%;
    background-size: cover;
    background-repeat: no-repeat;
  }
}
.backdrop-blur-fallback {
  backdrop-filter: blur(4.7px);
  -webkit-backdrop-filter: blur(4.7px);
}
</style>
