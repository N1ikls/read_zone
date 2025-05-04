<script setup lang="ts"></script>

<template>
  <div class="app-footer">
    <div class="app-footer-content">
      <div class="app-footer__logo">
        <Icon name="my-icons:logo" />

        <div class="app-footer__info">Ⓒ 2023 Readzone. Все права защищены.</div>
      </div>

      <div class="app-footer__info">
        <div class="description">
          Лицензия <br />
          Для правообладателя <br />
          Пользовательское соглашение
        </div>

        <div class="email">
          <div class="email__text">
            Поддержка: <span class="email__text-link">readzone@gmail.com</span>
          </div>

          <div class="email__icon">
            <Icon name="my-icons:telegram" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
%font {
  font-size: 15px;
  font-family: 'Montserrat';
  font-weight: 400;
  line-height: 20px;
  color: #1c3a7e;
}

.app-footer {
  height: 100%;
  display: flex;
  align-items: flex-end;

  &__info {
    @extend %font;
  }

  &-content {
    margin-bottom: 100px;
    display: grid;
    grid-template-columns: 2.5fr 1fr;
    flex: 1;
    gap: 20px;
  }
  &__logo {
    font-size: 50px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}
.description {
  @extend %font;
  line-height: 150%;
  margin-bottom: 8px;
}

.email {
  @extend %font;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &__text {
    &-link {
      text-decoration: underline;
    }
  }

  &__icon {
    font-size: 33px;
    cursor: pointer;
  }
}
</style>
