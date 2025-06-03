import BaseStorage from './base-storage.js'
import Validator from 'validatorjs'

export default class extends BaseStorage {
  get table() { return 'chapter_error' }
  get tableBook() { return 'book' }
  get tableChapter() { return 'chapter' }
  get tableUser() { return 'user' }

  beforeSave(error, actor) {
    const data = {}
    const rules = {}

    if (!error.id) {
      data.created_by = actor.id
      data.chapter_id = error.chapter_id
      rules.created_by = 'required|integer|min:1'
      rules.chapter_id = 'required|integer|min:1'
    }

    if ('source' in error) {
      data.source = error.source
      rules.source = 'required|string|min:1'
    } else if (!error.id) {
      rules.source = 'required'
    }

    if ('correct' in error) {
      data.correct = error.correct?.trim()
      rules.correct = 'required|string|min:1'
    } else if (!error.id) {
      rules.correct = 'required'
    }

    if ('paragraph' in error) {
      data.paragraph = error.paragraph
      rules.paragraph = 'required|integer|min:1'
    } else if (!error.id) {
      rules.paragraph = 'required'
    }

    if ('line' in error) {
      data.line = error.line
      rules.line = 'required|integer|min:1'
    } else if (!error.id) {
      rules.line = 'required'
    }

    const validator = new Validator(data, rules)

    return validator.passes() ? data : validator
  }

  async isWriteable(error, actor) {
    if (!actor) return false
    if (actor.role === 'admin') return true
    if (error.created_by === actor.id) return true

    const books = await this.knex(this.tableBook)
      .innerJoin(this.tableChapter, `${this.tableChapter}.book_id`, `${this.tableBook}.id`)
      .where(`${this.tableChapter}.id`, error.chapter_id)
      .where(`${this.tableBook}.translator_id`, actor.id)
      .select('*')

    if (books.length) return true

    return false
  }

  preprocessSelectQuery(query, filter, options) {
    if (options.filterByBookId) {
      query
        .join(this.tableChapter, `${this.tableChapter}.id`, `${this.table}.chapter_id`)
        .where(`${this.tableChapter}.book_id`, options.filterByBookId)
    }

    const within = options.with || []

    if (within.includes('chapter')) {
      if (!options.filterByBookId) {
        query.leftJoin(this.tableChapter, `${this.tableChapter}.id`, `${this.table}.chapter_id`)
      }
      query.select(`${this.tableChapter}.name as chapter_name`)
      query.select(`${this.tableChapter}.number as chapter_number`)
    }

    if (within.includes('user')) {
      query.leftJoin(this.tableUser, `${this.tableUser}.id`, `${this.table}.created_by`)
      query.select(`${this.tableUser}.name as user_name`)
    }
  }
}