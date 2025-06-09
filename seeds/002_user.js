import * as helper from './helper.js';
import security from '../security.js';

export async function seed(knex) {
  // Создаём администраторов
  const admins = [];
  for (let i = 1; i <= helper.ADMINS_COUNT; i++) {
    admins.push({
      email: `admin${i}@example.com`,
      password: security.getPasswordHash('123456'),
      name: `Админ ${i}`,
      role: 'admin',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }
  await knex('user').insert(admins).onConflict('email').ignore(); // Конфликт по email

  // Создаём обычных пользователей
  const users = [];
  for (let i = helper.ADMINS_COUNT + 1; i <= helper.USERS_COUNT; i++) {
    users.push({
      email: `user${i}@example.com`,
      password: security.getPasswordHash('123456'),
      name: `Юзер ${i}`,
      role: '',
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });
  }

  await knex('user').insert(users).onConflict('email').ignore(); // Конфликт по email
}
