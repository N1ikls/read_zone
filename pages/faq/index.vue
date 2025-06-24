<script setup lang="ts">
import { ROUTES, ITEMS } from './consts';
</script>

<template>
  <NuxtLayout name="default">
    <template #breadcrumb> <r-breadcrumb :options="ROUTES" /> </template>

    <template #title>
      <r-header
        size="v-large"
        bottom="0"
        class="uppercase text-[#003386]"
      >
        FAQ
      </r-header>
    </template>

    <div class="faq">
      <div class="grid">
        <div class="column flex flex-col gap-3">
          <UInput
            trailing-icon="i-lucide-search"
            size="xl"
            variant="none"
            highlight
            class="w-[100%]"
            color="info"
          />
          <div
            class="bg-[#F2F9FF] p-6 flex flex-col text-[#000000] text-xl rounded-lg"
          >
            <nuxt-link class="guide-link"
              >Как создать перевод на сайте tl.rulate.ru</nuxt-link
            >
            <nuxt-link class="guide-link">Свойства перевода</nuxt-link>
            <nuxt-link class="guide-link">Тэги / жанры / фэндомы</nuxt-link>
            <nuxt-link class="guide-link"
              >Как создать первую главу в переводе</nuxt-link
            >
            <nuxt-link class="guide-link"
              >Реклама вашего перевода на сайте</nuxt-link
            >
            <nuxt-link class="guide-link">Как пополнить баланс</nuxt-link>
            <nuxt-link class="guide-link"
              >Как найти интересный рассказ</nuxt-link
            >
            <nuxt-link class="guide-link">Ошибки в тексте</nuxt-link>
            <nuxt-link class="guide-link">Комментарии</nuxt-link>
            <nuxt-link class="guide-link">О читалке</nuxt-link>
            <nuxt-link class="guide-link">Видеоруководство</nuxt-link>
          </div>
          <div class="italic text-[#000000] text-[16px]">
            <div>Нет ответа на Ваш вопрос?</div>
            Напишите нам: <span>readzone@gmail.com</span>
          </div>
        </div>

        <UAccordion
          :items="ITEMS"
          :ui="{
            item: 'bg-[#F2F9FF] border-0 mb-5 rounded-lg',
            content: 'accordion-content',
            header: '',
            trigger: 'p-4 font-bold text-[#000000] ',
            label: 'accordion-label',
          }"
        />
      </div>
    </div>
  </NuxtLayout>
</template>

<style lang="scss" scoped>
.grid {
  display: grid;
  grid-template-columns: 1.4fr 2fr;
  gap: 14px;
}

:deep(.accordion-label) {
  font-size: 20px;
}
:deep(.accordion-content) {
  padding-left: 16px;

  div {
    font-size: 16px !important;
  }
}
</style>
