import * as helper from './helper.js';
import { v4 } from 'uuid';

export async function seed(knex) {
  // Сначала получаем существующие ID пользователей
  const existingUserIds = await knex('user').pluck('id');

  // FAQ (без внешних ключей)
  const faq = [];
  for (let id = 1; id <= helper.FAQ_COUNT; id++) {
    faq.push({
      number: id,
      name: `Вопрос ${id}`,
      content: helper.randomContent(`Ответ на вопрос ${id}.`, 20),
    });
  }
  await knex('faq').insert(faq).onConflict('number').ignore();

  // Новости (используем реальные ID пользователей)
  const news = [];
  for (let id = 1; id <= helper.NEWS_COUNT; id++) {
    news.push({
      created_at: helper.randomDate('2000-01-01', '2024-06-01'),
      created_by:
        existingUserIds[Math.floor(Math.random() * existingUserIds.length)], // Берём случайного существующего пользователя
      name: `Новость ${id}`,
      content: helper.randomContent(`Текст новости ${id}.`, 50),
    });
  }
  await knex('news').insert(news).onConflict().ignore();
}
