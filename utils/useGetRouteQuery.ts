import { omit } from 'lodash-es';

import type { ShallowRef } from 'vue';

const useGetRouteQuery = <T extends Partial<Record<keyof T, T[keyof T]>>>(
  defaultValue?: Partial<T>,
  omitQuery = ['tab'],
) => {
  const route = useRoute();
  const queries = shallowRef({});

  watchEffect(() => {
    queries.value = omit({ ...defaultValue, ...route.query }, [...omitQuery]);
  });

  return queries as ShallowRef<T>;
};

export default useGetRouteQuery;
