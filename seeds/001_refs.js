import * as helper from './helper.js';

export async function seed(knex) {
  const fandoms = [];
  for (let id = 1; id <= helper.FANDOMS_COUNT; id++) {
    fandoms.push({ name: `Фандом ${id}` });
  }

  await knex('fandom').insert(fandoms).onConflict().ignore();

  const genres = [];
  for (let id = 1; id <= helper.GENRES_COUNT; id++) {
    genres.push({ name: `Жанр ${id}` });
  }

  await knex('genre').insert(genres).onConflict().ignore();

  const bookTags = [];
  for (let id = 1; id <= helper.TAGS_COUNT; id++) {
    bookTags.push({ name: `Тег ${id}` });
  }

  await knex('tag').insert(bookTags).onConflict().ignore();
}
