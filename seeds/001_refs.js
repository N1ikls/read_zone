import * as helper from './helper.js';

export async function seed(knex) {
  const fandomNames = [
    'Марвел',
    'Гарри Поттер',
    'Ван Пис',
    'Наруто',
    'Атака титанов',
    'Моя геройская академия',
    'Токийский гуль',
    'Демон-истребитель',
    'Джоджо',
    'Берсерк',
    'Хвост феи',
    'Блич',
    'Драгон Болл',
    'Покемон',
    'Сейлор Мун',
    'Евангелион',
    'Стальной алхимик',
    'Тетрадь смерти',
    'Код Гиас',
    'Однажды в сказке',
  ];

  const fandoms = [];
  for (let i = 0; i < Math.min(helper.FANDOMS_COUNT, fandomNames.length); i++) {
    fandoms.push({ name: fandomNames[i] });
  }

  // Если нужно больше фэндомов, добавляем с номерами
  for (let id = fandomNames.length + 1; id <= helper.FANDOMS_COUNT; id++) {
    fandoms.push({ name: `Фандом ${id}` });
  }

  await knex('fandom').insert(fandoms).onConflict().ignore();

  // Жанры: используем реальные названия вместо заглушек
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

  const genres = [];
  // сначала — реальные имена
  for (let i = 0; i < Math.min(helper.GENRES_COUNT, genreNames.length); i++) {
    genres.push({ name: genreNames[i] });
  }
  // если нужно больше жанров, докидываем заглушки с номерами
  for (let i = genreNames.length + 1; i <= helper.GENRES_COUNT; i++) {
    genres.push({ name: `Жанр ${i}` });
  }

  await knex('genre').insert(genres).onConflict().ignore();

  const bookTags = [];
  for (let id = 1; id <= helper.TAGS_COUNT; id++) {
    bookTags.push({ name: `Тег ${id}` });
  }

  await knex('tag').insert(bookTags).onConflict().ignore();
}
