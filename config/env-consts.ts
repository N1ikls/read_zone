export interface EnvVars {
  readonly VITE_BACK_URL: string;
}

/**
 * @param { String } key        Ключ из .env
 * @param { String } defaultVal Значение по умолчанию
 */
const getEnvVar = (
  key: keyof EnvVars,
  defaultVal: string | undefined = undefined,
) => {
  const value =
    window[key as keyof typeof window] ?? import.meta.env[key] ?? defaultVal;

  if (value === undefined) {
    throw new Error(`Переменная ${key} обязательна`);
  }

  return value;
};

export const API_URL: string = getEnvVar('VITE_BACK_URL');
