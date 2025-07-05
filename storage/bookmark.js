import BaseStorage from './base-storage.js';
import errors from '../errors.js';

export default class extends BaseStorage {
  get table() {
    return 'bookmark';
  }

  get publicProperties() {
    return ['user_id', 'book_id', 'type'];
  }

  get types() {
    return ['all', 'process', 'discarded', 'favorite', 'planned'];
  }

  async save(bookmark, actor) {
    if (!('book_id' in bookmark)) {
      throw new errors.DBValidation([{ message: 'Нужен идентификатор книги' }]);
    }

    if (!('user_id' in bookmark)) {
      throw new errors.DBValidation([
        { message: 'Нужен идентификатор пользователя' },
      ]);
    }

    if (
      !(
        'type' in bookmark &&
        typeof bookmark.type === 'string' &&
        this.types.includes(bookmark.type)
      )
    ) {
      throw new errors.DBValidation([{ message: 'Неправильный тип закладки' }]);
    }

    await this.knex(this.table)
      .insert({
        book_id: bookmark.book_id,
        user_id: bookmark.user_id,
        type: bookmark.type,
      })
      .onConflict(['book_id', 'user_id'])
      .merge();

    return this.findOne({
      book_id: bookmark.book_id,
      user_id: bookmark.user_id,
    });
  }

  async findByType(userId, type = 'all') {
    if (type !== 'all' && !this.types.includes(type)) {
      throw new errors.DBValidation([{ message: 'Неправильный тип закладки' }]);
    }

    const query = { user_id: userId };
    if (type !== 'all') {
      query.type = type;
    }

    return this.find(query);
  }

  async getBookIdsByType(userId, type = 'all') {
    if (type !== 'all' && !this.types.includes(type)) {
      throw new errors.DBValidation([{ message: 'Неправильный тип закладки' }]);
    }

    const query = this.knex(this.table)
      .where('user_id', userId)
      .select('book_id');

    if (type !== 'all') {
      query.where('type', type);
    }

    const result = await query;
    return result.map((item) => item.book_id);
  }

  async getByUserId(userId) {
    return this.knex(this.table)
      .where('user_id', userId)
      .select('book_id', 'type');
  }

  async getType(userId, bookId) {
    return this.knex(this.table)
      .where({
        user_id: userId,
        book_id: bookId,
      })
      .first('type');
  }
}
