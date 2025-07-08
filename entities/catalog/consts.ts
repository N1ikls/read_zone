export enum Status {
  'discarded' = 'Заброшен',
  'done' = 'Завершенный',
  'frozen' = 'Заморожено',
  'progress' = 'В процессе',
}

export enum Type {
  'manga' = 'Манга',
  'oel' = 'OEL-манга',
  'manhva' = 'Манхва',
  'manhua' = 'Маньхуа',
  'rumanga' = 'Руманга',
  'comic' = 'Комикс',
}

export const BOOKS_TYPE = [
  { label: 'Манга', value: 'manga' },
  { label: 'OEL-манга', value: 'oel' },
  { label: 'Манхва', value: 'manhva' },
  { label: 'Маньхуа', value: 'manhua' },
  { label: 'Руманга', value: 'rumanga' },
  { label: 'Комикс', value: 'comic' },
];

export const BOOKS_AGE = [
  { label: 'Нет', value: '0' },
  { label: '16+', value: '16' },
  { label: '6+', value: '6' },
  { label: '18+', value: '18' },
  { label: '12+', value: '12' },
];

export const RELEASE_TYPE = [
  { label: '4-Кома (Ёнкома)', value: '4coma' },
  { label: 'Сборник', value: 'collection' },
  { label: 'Додзинси', value: 'dodzinsi' },
  { label: 'В цвете', value: 'color' },
  { label: 'Сингл', value: 'single' },
  { label: 'Веб', value: 'web' },
  { label: 'Вебтун', value: 'webtoon' },
];

export const OTHER = [
  { label: 'Нет перевода уже 3 месяца', value: 'progress' },
  { label: 'Лицензирован', value: 'done' },
  { label: 'Можно приобрести', value: 'frozen' },
];
