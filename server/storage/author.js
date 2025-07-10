import BaseStorage from './base-storage.js';
import errors from '../utils/errors';

export default class extends BaseStorage {
  get table() {
    return 'author';
  }
  get tableLiker() {
    return 'author_liker';
  }
  get tableSocial() {
    return 'author_social';
  }
  get tableSubscriber() {
    return 'author_subscriber';
  }

  get publicProperties() {
    return [
      'id',
      'name',
      'birth_date',
      'avatar',
      'books_count',
      'chapters_in_month',
      'likers_count',
      'subscribers_count',
    ];
  }

  afterFetch(author) {
    if (author.birth_date) author.birth_date = this.fixDate(author.birth_date);
    return author;
  }

  async search(query) {
    const sortOptions = {
      name: { name: 'asc' },
      books: { books_count: 'desc' },
      updated: { updated_at: 'desc' },
      popular: { likers_count: 'desc' },
    };

    const filter = [];
    const options = {};

    if (query.sort && sortOptions[query.sort]) {
      options.order = sortOptions[query.sort];
    }

    if (query.id) filter.push({ id: query.id });
    if (query.name) filter.push({ name: { like: `%${query.name}%` } });
    if (query.min_books)
      filter.push({ books_count: { '>=': query.min_books } });
    if (query.min_subs)
      filter.push({ subscribers_count: { '>=': query.min_subs } });

    const authors = await this.find(filter, options);

    return authors.map((author) => this.afterFetch(author));
  }

  beforeSave(author, user) {
    const data = {};

    if ('name' in author) {
      if (typeof author.name !== 'string')
        throw new errors.DBValidation([
          { field: 'name', message: 'Имя должно быть строкой' },
        ]);

      const name = author.name.trim();
      if (author.length === 0)
        throw new errors.DBValidation([
          { field: 'name', message: 'У автора должно быть имя' },
        ]);

      data.name = name;
    } else if (!author.id) {
      throw new errors.DBValidation([
        { field: 'name', message: 'У автора должно быть имя' },
      ]);
    }

    if ('birth_date' in author) {
      if (author.birth_date) {
        const birth_date =
          author.birth_date instanceof Date
            ? author.birth_date
            : new Date(author.birth_date);

        if (isNaN(birth_date.getTime()))
          throw new errors.DBValidation([
            { field: 'birth_date', message: 'Неправильная дата рождения' },
          ]);

        data.birth_date = birth_date.toISOString().substring(0, 10);
      } else {
        data.birth_date = null;
      }
    }

    if ('avatar' in author) data.avatar = author.avatar;

    if (author.id && user) {
      data.updated_at = this.fixDate(new Date());
      data.updated_by = user.id;
    } else if (!author.id) data.created_by = user.id;

    if (Object.keys(data).length === 0)
      throw new errors.DBValidation([{ message: 'Нечего сохранять' }]);

    return data;
  }

  async isWriteable(author, actor) {
    if (!actor) return false;
    if (actor.role === 'admin') return true;
    if (author.created_by === actor.id) return true;

    return false;
  }
}
