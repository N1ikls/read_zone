import BaseStorage from './base-storage.js'

export default class extends BaseStorage {
  get table() { return 'reading_history' }

  async save(record, actor) {
    await this.knex(this.table)
      .insert({
        user_id: actor.id,
        book_id: record.book_id,
        chapter_number: record.chapter_number
      })
      .onConflict().merge()

    return this.findOne({user_id: actor.id, book_id: record.book_id})
  }
}
