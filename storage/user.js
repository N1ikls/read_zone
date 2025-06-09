import BaseStorage from './base-storage.js';
import errors from '../errors.js';
import security from '../security.js';
import { v4 as uuidv4 } from 'uuid';
export default class extends BaseStorage {
  get table() {
    return 'user';
  }
  get tableLiker() {
    return 'user_liker';
  }
  get tableSocial() {
    return 'user_social';
  }
  get tableSubscriber() {
    return 'user_subscriber';
  }

  get publicProperties() {
    return [
      'id',
      'name',
      'avatar',
      'books_count',
      'chapters_in_month',
      'likers_count',
      'subscribers_count',
    ];
  }

  afterFetch(user) {
    user.email_subscription = user.email_subscription > 0;

    delete user.password;

    return user;
  }

  beforeSave(user, actor) {
    if (user.id) {
      if (!('name' in user))
        throw new errors.DBValidation([
          { field: 'name', message: 'У пользователя должно быть имя' },
        ]);
    }

    const data = {};

    if ('name' in user) {
      if (typeof user.name !== 'string')
        throw new errors.DBValidation([
          { field: 'name', message: 'Имя должно быть строкой' },
        ]);

      const name = user.name.trim();
      if (name.length < 1)
        throw errors.DBValidation([
          { field: 'name', message: 'Имя не может быть пустым' },
        ]);

      data.name = name;
    }

    if ('email' in user) {
      if (typeof user.email !== 'string')
        throw new errors.DBValidation([
          { field: 'email', message: 'E-mail должен быть строкой' },
        ]);

      const email = user.email.trim();
      if (!/^[^@]+@[^@]+\.[^@]+$/.test(email))
        throw new errors.DBValidation([
          { field: 'email', message: 'E-mail выглядит так: user@example.com' },
        ]);

      data.email = email;
    }

    if ('role' in user && actor.role === 'admin') {
      if (!['', 'admin', 'moderator'].includes(user.role))
        throw new errors.DBValidation([
          { field: 'role', message: `Неизвестная роль ${user.role}` },
        ]);

      data.role = user.role;
    }

    if ('email_subscription' in user) {
      if (user.email_subscription === true) data.email_subscription = 1;
      else if (user.email_subscription === false) data.email_subscription = 0;
      else
        throw new errors.DBValidation([
          { field: 'email_subscription', message: 'Неправильное значение' },
        ]);
    }

    if ('avatar' in user) data.avatar = user.avatar;

    return data;
  }

  async isWriteable(user, actor) {
    if (!actor) return false;
    if (actor.role === 'admin') return true;
    if (user.id === actor.id) return true;

    return false;
  }

  async login(login, password) {
    const users = await this.knex(this.table)
      .where({ email: login })
      .select('*');
    if (!users.length) return false;

    const user = users[0];
    if (!security.isPasswordValid(password, user.password)) return false;

    return this.afterFetch(user);
  }

  async registration(login, username, password) {
    const existingUsers = await this.knex(this.table)
      .where({ email: login })
      .select('id');

    if (existingUsers.length > 0)
      return new errors.DBValidation([
        {
          field: 'email',
          message: 'Пользователь с таким email уже существует',
        },
      ]);

    const hashedPassword = security.getPasswordHash(password);

    const userid = await this.knex(this.table)
      .insert({
        email: login,
        password: hashedPassword,
        name: username,
      })
      .returning('id');

    console.log('userId', userid);

    const newUser = await this.knex(this.table)
      .where({ id: userid })
      .select('*');

    return this.afterFetch(newUser[0]);
  }
}
