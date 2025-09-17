export interface EnvVars {
  readonly VITE_DB_HOST: string;
  readonly VITE_DB_PORT: string;
  readonly VITE_DB_USER: string;
  readonly VITE_DB_PASSWORD: string;
  readonly VITE_DB_NAME: string;
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

export const DB_HOST: string = getEnvVar('VITE_DB_HOST');
export const DB_PORT: string = getEnvVar('VITE_DB_PORT');
export const DB_USER: string = getEnvVar('VITE_DB_USER');
export const DB_NAME: string = getEnvVar('VITE_DB_NAME');
export const DB_PASSWORD: string = getEnvVar('VITE_DB_PASSWORD');
