import BaseStorage from './base-storage.js'

export default class extends BaseStorage {
  get table() { return 'tag' }

  get publicProperties() {
    return [
      'id',
      'name',
    ]
  }
}
