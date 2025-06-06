import { defineStore } from 'pinia';

export const useCatalogState = defineStore('catalog', () => {
  const isSidebar = ref<boolean>(false);

  const showSidebar = () => {
    isSidebar.value = !isSidebar.value;
  };

  return { isSidebar, showSidebar };
});
