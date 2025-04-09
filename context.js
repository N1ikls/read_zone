export default class Context {
  #session
  #storage
  #user

  constructor(session, storage) {
    this.#storage = storage
    this.#session = session
  }

  async getExportData() {
    return {
      user: this.#storage.user.toPublic(await this.user())
    }
  }

  async user() {
    if (this.#user === undefined) {
      if ( ! ('user' in this.#session)) return null

      this.#user = await this.#storage.user.findOne({id: this.#session.user.id})
    }

    return this.#user
  }
}
