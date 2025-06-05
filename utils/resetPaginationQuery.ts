const resetPaginationQuery = (
  value: Record<string, string | string[] | number> = {},
) => ({
  ...value,
  page: '',
});

export default resetPaginationQuery;
