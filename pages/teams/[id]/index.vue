<script setup lang="ts">
import numeral from 'numeral';
import { TABS } from './consts';
import { TeamInfo, TeamWorks, ApplyModal, TeamRequest } from '@/entities/teams';
import type { TeamsApiResponse, Team } from '@/shared/types';

const route = useRoute();
const router = useRouter();

const guid = computed(() => route.params?.id);

const { data, refresh } = await useFetch('/api/teams', {
  key: computed(() => `team-${guid.value}`),
  query: { guid: guid.value },
  transform: (response: TeamsApiResponse) => {
    const { teams, ...obj } = response?.items;

    return {
      ...obj,
      ...(teams?.at(0) || {}),
    } as Team;
  },
  default: () => ({}) as Team,
});

const active = computed({
  get() {
    return (route.query.tab as string) || 'main';
  },
  set(tab: string) {
    router.push({
      query: {
        ...route.query,
        tab: tab ?? undefined,
      },
    });
  },
});

const ROUTES = computed(() => [
  { label: 'Главная', to: '/' },
  { label: 'Команды', to: '/teams' },
  { label: data.value.name },
]);
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb>
      <r-breadcrumb :options="ROUTES" />
    </template>

    <div class="team">
      <header class="team__header relative">
        <div class="team__header-bg" />

        <div class="team__header-content">
          <div class="team__header-info">
            <div class="flex gap-5">
              <span
                class="relative inline-flex shrink-0 aspect-[2/3] overflow-hidden rounded-[6px] select-none w-20 md:w-30 lg:w-40 lg:h-50"
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
                  :src="data.avatar || '/test_banner_2.png'"
                  :alt="data.name"
                />
              </span>

              <div class="flex flex-col flex-1 gap-2">
                <div class="flex items-start gap-2 justify-between flex-wrap">
                  <div
                    class="flex flex-col flex-1 gap-2 h-full justify-between"
                  >
                    <div class="flex items-center gap-4">
                      <span
                        class="font-bold text-[28px] cs-text leading-md ellipsis"
                      >
                        {{ data?.name }}
                      </span>

                      <div
                        v-if="data?.rate"
                        class="flex flex-wrap gap-1 items-center"
                      >
                        <u-icon
                          mode="svg"
                          class="rate text-[#0862e0]"
                          name="my-icons:rate"
                        />

                        <p class="font-bold">{{ data.rate.toFixed(2) }}</p>
                      </div>
                    </div>

                    <div
                      class="flex flex-1 flex-wrap justify-center gap-2 md:justify-start -mx-2 items-center"
                    >
                      <r-text
                        class="px-2.5 py-1"
                        icon="my-icons:people-black"
                        :size-svg="22"
                      >
                        {{
                          numeral(data?.teammates_count)
                            .format('0.[0]a')
                            .toUpperCase()
                        }}
                      </r-text>

                      <r-text
                        class="px-2.5 py-1"
                        :size-svg="22"
                        icon="my-icons:chart"
                      >
                        {{ data?.subscribers_count }}
                      </r-text>

                      <r-text
                        class="px-2.5 py-1"
                        :size-svg="20"
                        icon="my-icons:like"
                      >
                        {{
                          numeral(data?.likers_count)
                            .format('0.[0]a')
                            .toUpperCase()
                        }}
                      </r-text>
                    </div>
                  </div>

                  <div class="flex flex-col gap-2">
                    <div
                      class="bg-[#FFFFFF] text-center px-5 py-2.5 font-bold text-[16px] rounded-[5px] leading-md"
                    >
                      {{
                        numeral(data?.books_count)
                          .format('0.[0]a')
                          .toUpperCase()
                      }}
                      тайтлов
                    </div>

                    <!-- <div
                      class="bg-[#FFFFFF] text-center px-5 py-2.5 font-bold text-[16px] rounded-[5px] leading-md"
                    >
                      Топ команд:
                      <nuxt-link
                        class="text-[#0862E0]"
                        to="/"
                        >#10</nuxt-link
                      >
                    </div> -->
                  </div>
                </div>

                <div class="flex-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-[12px] text-[#5E5E5E]">Частые теги</span>

                    <div
                      class="bg-[#FFFFFF] text-[12px] text-center py-2 px-4 rounded-[4px] cs-text leading-none"
                    >
                      Повседневность 12
                    </div>

                    <div
                      class="bg-[#FFFFFF] text-[12px] text-center py-2 px-4 rounded-[4px] cs-text leading-none"
                    >
                      Романтика 9
                    </div>
                  </div>
                </div>
                <div class="team__header__actions flex gap-2 items-center">
                  <u-button
                    class="font-bold"
                    color="info"
                    block
                    size="xl"
                  >
                    Подписаться
                  </u-button>

                  <ApplyModal
                    :guid="data.id"
                    :name="data.name"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section class="mt-7">
        <UTabs
          v-model="active"
          color="info"
          :unmountOnHide="false"
          :items="TABS"
          class="w-full min-w-0"
          :ui="{
            root: 'gap-4',
            list: 'rounded-[10px] light:bg-[#F5F5F5] overflow-x-scroll',
            indicator: 'rounded-[10px]',
            trigger: 'min-w-[auto]',
          }"
        >
          <template #main>
            <TeamInfo
              :item="data"
              @refresh="refresh"
            />
          </template>
          <template #work>
            <TeamWorks />
          </template>
          <template #request>
            <TeamRequest />
          </template>
        </UTabs>
      </section>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.team {
  &__header {
    position: relative;
    min-height: 192px;

    &-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 192px;
      opacity: 0.78;
      border-radius: 22px;
      background-image: url(../../../public/test_banner_2.png);
      background-position: 50% 50%;
      background-size: cover;
      background-repeat: no-repeat;
      z-index: 1;
    }

    &-content {
      position: relative;
      z-index: 2;
      padding-top: 192px;
    }

    &-info {
      background: var(--bg-card);
      padding: 26px;
      border-radius: 22px;
      margin-top: -40px;
      position: relative;
      z-index: 3;
      width: 100%;
    }
  }
}
</style>
