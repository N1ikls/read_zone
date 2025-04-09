import BaseStorage from './base-storage.js'
import errors from '../errors.js'

export default class extends BaseStorage {
  get isDislikeable() { return true }

  get publicProperties() {
    return [
      'id',
      'content',
      'created_at',
      'created_by',
      'user_name',
      'likers_count',
      'dislikers_count',
      'is_liked',
    ]
  }

  afterFetch(comment) {
    if ('is_liked' in comment) comment.is_liked = comment.is_liked === 1 ? true : (comment.is_liked === 0 ? false : null)

    return comment
  }

  beforeSave(comment, actor) {
    const data = {}

    if (comment.id) {
      data.updated_at = this.fixDate(new Date())
      data.updated_by = actor.id
    } else {
      data.created_by = actor.id

      if (!([this.entityIdProperty] in comment)) throw new errors.DBValidation([{message: 'Сущность не указана'}])
      if (!('content' in comment)) throw new errors.DBValidation([{field: 'content', message: 'Нет содержимого'}])
    }

    if (this.entityIdProperty in comment) {
      if (typeof(comment[this.entityIdProperty]) !== 'number' || comment[this.entityIdProperty] < 1) throw new errors.DBValidation([{message: 'Неправильный идентификатор сущности'}])
      data[this.entityIdProperty] = comment[this.entityIdProperty]
    }

    if ('content' in comment) {
      if (typeof(comment.content) !== 'string') throw new errors.DBValidation([{field: 'content', message: 'Комментарий должен быть строкой'}])

      const content = comment.content.trim()
      if (content.length === 0) throw new errors.DBValidation([{field: 'content', message: 'Комментарий не может быть пустым'}])

      data.content = content
    }

    return data
  }

  preprocessSelectQuery(query, filter, options) {
    query
      .leftJoin('user', 'user.id', `${this.table}.created_by`)
      .select('user.name as user_name')

    const within = options.with || []

    if (within.includes('is_liked') && options.actor) {
      const self = this

      query
        .leftJoin(this.tableLiker, function() {
          this.on(`${self.tableLiker}.${self.table}_id`, `${self.table}.id`)
            .on(`${self.tableLiker}.liker_id`, options.actor.id)
        })
        .select(`${this.tableLiker}.positive as is_liked`)
    }
  }
}
