import {applyFilter} from '../query-builder.js'
import BaseStorage from './base-storage.js'
import errors from '../errors.js'
import Validator from 'validatorjs'

export default class extends BaseStorage {
  get table() { return 'pay' }
  get tableChapter() { return 'chapter' }
  get tableChapterBuyer() { return 'chapter_buyer' }

  get publicProperties() {
    return [
      'id',
      'type',
      'payed',
      'details',
    ]
  }

  afterFetch(pay) {
    if ('details' in pay) pay.details = JSON.parse(pay.details)
    if ('payed' in pay) pay.payed = pay.payed != 0

    return pay
  }

  beforeSave(pay, actor) {
    if (!actor) throw new errors.Forbidden()

    const data = {}
    const rules = {}

    if ('type' in pay) {
      data.type = pay.type
      rules.type = 'in:chapters'
    } else {
      rules.type = 'required'
    }

    if ('details' in pay) {
      data.details = JSON.stringify(pay.details)
    }

    if (!pay.id) {
      data.created_by = actor.id
    }

    const validator = new Validator(data, rules, {
      'in.type': 'Нужен тип платежа',
    })

    return validator.passes() ? data : validator
  }

  async success(pay, actor) {
    if (pay.type === 'chapters') await this.#successChapters(pay, actor)
    else throw new errors.DBValidation([{field: 'type', message: 'Неизвестный тип платежа'}])

    await this.knex(this.table).where({id: pay.id}).update({payed: true})

    return this.findOne({id: pay.id})
  }

  async #successChapters(pay, actor) {
    const query = this.knex(this.tableChapter)
    applyFilter(query, {
      book_id: pay.details.book_id,
      number: pay.details.chapters,
    }, this.tableChapter)
    const chapters = await query.select('*')

    const rows = chapters.map(chapter => {
      return {chapter_id: chapter.id, user_id: actor.id, pay_id: pay.id, end_time: null}
    })

    await this.knex(this.tableChapterBuyer).insert(rows).onConflict().merge()
  }
}