import * as helper from './helper.js';
import { v4 } from 'uuid';

export async function seed(knex) {
  const existingUserIds = await knex('user').pluck('id');

  const authors = [];
  for (let id = 1; id <= helper.AUTHORS_COUNT; id++) {
    authors.push({
      created_by:
        existingUserIds[Math.floor(Math.random() * existingUserIds.length)],
      name: `Автор ${id}`,
      birth_date: helper
        .randomDate('1900-01-01', '2000-01-01')
        .toISOString()
        .substring(0, 10),
    });
  }

  await knex('author').insert(authors).onConflict().ignore();
}
