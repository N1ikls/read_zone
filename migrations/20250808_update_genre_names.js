/**
 * Миграция: заменить заглушки жанров на реальные названия
 * - Обновляет строки, где name LIKE 'Жанр%' (или точно 'Жанр')
 * - Заполняет по порядку из списка genreNames, начиная с id=1 и далее
 * - Не трогает уже осмысленные имена
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = async function up(knex) {
  const genreNames = [
    'Фэнтези',
    'Приключения',
    'Комедия',
    'Романтика',
    'Драма',
    'Ужасы',
    'Триллер',
    'Детектив',
    'Научная фантастика',
    'Повседневность',
    'Боевые искусства',
    'История',
    'Психология',
    'Спорт',
    'Сёнэн',
    'Сейнен',
    'Сёдзё',
    'Дзёсэй',
    'Исэкай',
    'Мистика',
  ];

  // Получаем все жанры по id и имени
  const rows = await knex('genre').select(['id', 'name']).orderBy('id', 'asc');

  // Собираем список id, которые сейчас содержат заглушки
  const placeholderRegex = /^Жанр(\s+\d+)?$/i;

  const updates = [];
  let nameIndex = 0;

  for (const row of rows) {
    const isPlaceholder = placeholderRegex.test((row.name || '').trim());
    if (!isPlaceholder) continue;

    if (nameIndex < genreNames.length) {
      updates.push({ id: row.id, name: genreNames[nameIndex] });
      nameIndex += 1;
    }
  }

  // Применяем обновления пакетно
  for (const u of updates) {
    await knex('genre').where({ id: u.id }).update({ name: u.name });
  }
};

/**
 * Откат: возвращаем заглушки в исходном детерминированном виде 'Жанр N'
 * Важно: делаем это только для тех записей, которые входят в первые N по id,
 * чтобы избежать переименования кастомных значений, созданных после миграции.
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const down = async function down(knex) {
  const rows = await knex('genre').select(['id']).orderBy('id', 'asc');

  // Считаем, сколько первых жанров мы потенциально переименовывали в up
  const limit = 20; // длина массива genreNames выше

  let counter = 1;
  for (const row of rows) {
    if (counter > limit) break;
    await knex('genre').where({ id: row.id }).update({ name: `Жанр ${counter}` });
    counter += 1;
  }
};

