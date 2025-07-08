export const useGuidsChecked = <T>(items: Ref<T> | T) => {
  const guidsChecked = reactive<Set<number | string>>(new Set());

  const isAllChecked = computed(
    () =>
      guidsChecked.size === unref(items)?.length && unref(items)?.length > 0,
  );

  const toggleGuid = (number: number | string) => {
    if (guidsChecked.has(number)) {
      guidsChecked.delete(number);

      return;
    }
    guidsChecked.add(number);
  };

  const toggleAll = () => {
    if (isAllChecked.value) {
      guidsChecked.clear();

      return;
    }

    unref(items).forEach((item) => {
      guidsChecked.add(item.number as number);
    });
  };

  return {
    guidsChecked,
    isAllChecked,
    toggleAll,
    toggleGuid,
  };
};
