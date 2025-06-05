const splitQueryValue = (value: string | undefined): string[] => {
  if (!value) return [];

  const re = /,(?!\s+)/;

  return value.split(re);
};

export default splitQueryValue;
