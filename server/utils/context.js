export default class Context {
  #session;
  #storage;
  #user;

  constructor(session, storage) {
    this.#storage = storage;
    this.#session = session;
  }

  async getExportData() {
    return {
      user: this.#storage.user.toPublic(await this.user()),
    };
  }

  async user() {
    if (this.#user === undefined) {
      if (!('user' in this.#session)) return null;

      // Валидация ID пользователя
      if (!this.#session.user.id || typeof this.#session.user.id !== 'string') {
        console.warn('Invalid user ID in session:', this.#session.user.id);
        return null;
      }

      try {
        this.#user = await this.#storage.user.findOneOptimized({
          id: this.#session.user.id,
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        this.#user = null;
      }
    }

    return this.#user;
  }
}
