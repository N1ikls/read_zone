export const useGuidsChecked = <T>(items: Ref<T> | T) => {
  const guidsChecked = reactive<Set<string>>(new Set());

  const isAllChecked = computed(
    () =>
      guidsChecked.size === unref(items)?.length && unref(items)?.length > 0,
  );

  const toggleGuid = (guid: string) => {
    if (guidsChecked.has(guid)) {
      guidsChecked.delete(guid);

      return;
    }
    guidsChecked.add(guid);
  };

  const toggleAll = () => {
    if (isAllChecked.value) {
      guidsChecked.clear();

      return;
    }

    unref(items).forEach((item) => {
      guidsChecked.add(item.id);
    });
  };

  const isGuids = computed(() => guidsChecked.size !== 0);

  return {
    isGuids,
    guidsChecked,
    isAllChecked,
    toggleAll,
    toggleGuid,
  };
};
