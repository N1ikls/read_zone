const useLocalData = () => {
  const setData = <T>(value: T, key: string) => {
    if (!key) return;

    if (process.client) {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  const getData = <T>(key: string): T | null => {
    if (!key) return null;
    let data = null;

    if (process.client) {
      data = JSON.parse(localStorage.getItem(key) || 'null');
    }

    return data;
  };

  const clearData = (key: string) => {
    if (!key) return;

    if (process.client) {
      localStorage.removeItem(key);
    }
  };

  return { setData, getData, clearData };
};

export default useLocalData;
