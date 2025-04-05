import BaseStorage from './base-storage.js'
import errors from '../errors.js'

export default class extends BaseStorage {
  get table() { return 'bookmark' }

  get publicProperties() {
    return [
      'user_id',
      'book_id',
      'type',
    ]
  }

  get types() {
    return [
      'process',
      'discarded',
      'favorite',
      'planned',
    ]
  }

  async save(bookmark, actor) {
    if (!('book_id' in bookmark && typeof(bookmark.book_id) === 'number' && bookmark.book_id > 0)) {
      throw new errors.DBValidation([{message: 'Нужен идентификатор книги'}])
    }

    if (!('user_id' in bookmark && typeof(bookmark.user_id) === 'number' && bookmark.user_id > 0)) {
      throw new errors.DBValidation([{message: 'Нужен идентификатор пользователя'}])
    }

    if (!('type' in bookmark && typeof(bookmark.type) === 'string' && this.types.includes(bookmark.type))) {
      throw new errors.DBValidation([{message: 'Неправильный тип закладки'}])
    }

    await this.knex(this.table)
      .insert({book_id: bookmark.book_id, user_id: bookmark.user_id, type: bookmark.type})
      .onConflict().merge()

    return this.findOne({book_id: bookmark.book_id, user_id: bookmark.user_id})
  }
}
