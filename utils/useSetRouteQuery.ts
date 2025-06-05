const useSetRouteQuery = () => {
  const route = useRoute();
  const router = useRouter();

  const setRouteQueries = <T extends object>(
    value: Record<keyof T, string | undefined>,
  ): void => {
    const query = {
      ...route.query,
      ...value,
    };

    Object.keys(query).forEach((key: string) => {
      if (!query[key]) delete query[key];
    });

    router.push({ query });
  };

  return setRouteQueries;
};

export default useSetRouteQuery;
