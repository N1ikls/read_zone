import { defineStore } from 'pinia';

export const useAuth = defineStore('auth', () => {
  const isShow = ref<boolean>(false);

  const showModal = () => {
    isShow.value = !isShow.value;
  };

  return { isShow, showModal };
});
