import BaseStorage from './base-storage.js'

export default class extends BaseStorage {
  get table() { return 'news' }
  get tableCreator() { return 'user' }

  get publicProperties() {
    return [
      'id',
      'created_at',
      'name',
      'content',
      'creator_name',
    ]
  }

  preprocessSelectQuery(query, filter, options) {
    const within = options.with || []

    if (within.includes('creator')) {
      query
        .leftJoin(this.tableCreator, `${this.tableCreator}.id`, `${this.table}.created_by`)
        .select(`${this.tableCreator}.name as creator_name`)
    }
  }
}
