const useLocalData = (storageProvider: Storage = localStorage) => {
  const setData = <T>(value: T, key: string) => {
    if (!value || !key) return;

    storageProvider.setItem(key, JSON.stringify(value));
  };

  const getData = <T>(key: string): T | null => {
    if (!key) return null;

    const data = JSON.parse(storageProvider.getItem(key) || 'null');

    return data;
  };

  const clearData = (key: string) => {
    if (!key) return;
    storageProvider.removeItem(key);
  };

  return { setData, getData, clearData };
};

export default useLocalData;
