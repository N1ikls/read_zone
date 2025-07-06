import { applyFilter, applyOptions } from '../query-builder.js';
import errors from '../errors.js';
import Validator from 'validatorjs';

export default class BaseStorage {
  #knex;

  constructor(knex) {
    this.#knex = knex;
  }

  async delete(filter, options = {}) {
    const query = this.knex(this.table);
    applyFilter(query, filter, this.table);

    return query.delete();
  }

  async find(filter, options = {}) {
    const query = this.knex(this.table);
    if (this.preprocessSelectQuery)
      this.preprocessSelectQuery(query, filter, options);
    applyFilter(query, filter, this.table);
    applyOptions(query, options, this.table);
    let rows = (await query.select(`${this.table}.*`)).map((row) => {
      return { ...row };
    });

    if (this.afterFetch) rows = rows.map((row) => this.afterFetch(row));
    if (options.toPublic) rows = rows.map((row) => this.toPublic(row));

    return rows;
  }

  async findOne(filter, options = {}) {
    const rows = await this.find(filter, options);

    if (rows.length > 1)
      throw new Error(
        `Найдено несколько ${this.table} по фильтру ${JSON.stringify(filter)}`,
      );

    return rows[0];
  }

  fixDate(date) {
    var tzoffset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - tzoffset);
  }

  get knex() {
    return this.#knex;
  }

  async save(entity, actor) {
    const data = this.beforeSave(entity, actor);
    if (data instanceof Validator) {
      const errorList = [];
      for (const [field, messages] of Object.entries(data.errors.all())) {
        for (const message of messages) errorList.push({ field, message });
      }

      throw new errors.DBValidation(errorList);
    }

    let id;

    if (entity.id) {
      await this.knex(this.table).where({ id: entity.id }).update(data);
      id = entity.id;
    } else {
      [id] = await this.knex(this.table).insert(data);
    }

    return await this.findOne({ id });
  }

  toPublic(entity) {
    if (!entity) return entity;
    if (Array.isArray(entity))
      return entity.map((entity) => this.toPublic(entity));

    const result = {};
    for (const property of this.publicProperties)
      result[property] = entity[property];

    return result;
  }

  // Socials

  async getSocials(entity) {
    const query = this.knex(this.tableSocial);
    applyFilter(query, { [`${this.table}_id`]: entity.id }, this.tableSocial);
    const rows = await query.select('*');

    return rows.map((row) => {
      return { ...row };
    });
  }

  async setSocials(entity, socials) {
    if (!entity?.id)
      throw new errors.DBValidation(
        'Ссылки можно сохранить только для конкретной сущности',
      );

    const ids = socials.map((social) => social?.id).filter((id) => !!id);
    const deleteQuery = this.knex(this.tableSocial);
    applyFilter(
      deleteQuery,
      { [`${this.table}_id`]: entity.id, id: { '!=': ids } },
      this.tableSocial,
    );
    await deleteQuery.delete();

    for (const index in socials) {
      const social = socials[index];
      const data = {};
      if ('uri' in social) data.uri = social.uri;

      if (Object.keys(data).length === 0)
        throw new errors.DBValidation(`Нечего сохранять в ссылке #${index}`);

      if (social?.id) {
        await this.knex(this.tableSocial)
          .where({ id: social.id, [`${this.table}_id`]: entity.id })
          .update(data);
      } else {
        await this.knex(this.tableSocial).insert({
          ...data,
          [`${this.table}_id`]: entity.id,
        });
      }
    }

    return await this.getSocials(entity);
  }

  // Likes

  async isLiked(entity, liker, positive = true) {
    if (!liker) return false;

    const filter = { [`${this.table}_id`]: entity.id, liker_id: liker.id };
    if (this.isDislikeable) filter.positive = positive;
    const rows = await this.knex(this.tableLiker).where(filter).select('*');

    return rows.length > 0;
  }

  async like(entity, liker, positive = true) {
    const data = { [`${this.table}_id`]: entity.id, liker_id: liker.id };
    if (this.isDislikeable) data.positive = positive;
    await this.knex(this.tableLiker).insert(data).onConflict().merge();

    return this.likers_recount(entity);
  }

  async likers_count(entity, positive = true) {
    const filter = { [`${this.table}_id`]: entity.id };
    if (this.isDislikeable) filter.positive = positive;
    const count = await this.knex(this.tableLiker).where(filter).count('*');

    return count[0]?.count;
  }

  async likers_recount(entity) {
    const filter = { [`${this.table}_id`]: entity.id };
    if (this.isDislikeable) filter.positive = true;
    const data = {
      likers_count: this.knex(this.tableLiker).where(filter).count('*'),
    };

    if (this.isDislikeable) {
      filter.positive = false;
      data.dislikers_count = this.knex(this.tableLiker)
        .where(filter)
        .count('*');
    }

    return this.knex(this.table).where({ id: entity.id }).update(data);
  }

  async unlike(entity, liker) {
    await this.knex(this.tableLiker)
      .where({ [`${this.table}_id`]: entity.id, liker_id: liker.id })
      .delete();

    return this.likers_recount(entity);
  }

  // Views
  async view(entity, viewer) {
    const data = { [`${this.table}_id`]: entity.id, viewer_id: viewer.id };
    await this.knex(this.tableViewer).insert(data).onConflict().merge();

    return this.viewers_recount(entity);
  }

  async viewers_count(entity) {
    const filter = { [`${this.table}_id`]: entity.id };
    const count = await this.knex(this.tableViewer).where(filter).count('*');

    return count[0]['count(*)'];
  }

  async viewers_recount(entity) {
    const filter = { [`${this.table}_id`]: entity.id };
    const data = {
      viewers_count: this.knex(this.tableViewer).where(filter).count('*'),
    };

    return this.knex(this.table).where({ id: entity.id }).update(data);
  }

  // Subscriptions

  async isSubscribed(entity, subscriber) {
    if (!subscriber) return false;

    const rows = await this.knex(this.tableSubscriber)
      .where({ [`${this.table}_id`]: entity.id, subscriber_id: subscriber.id })
      .select('*');

    return rows.length > 0;
  }

  async subscribe(entity, subscriber) {
    await this.knex(this.tableSubscriber)
      .insert({ [`${this.table}_id`]: entity.id, subscriber_id: subscriber.id })
      .onConflict()
      .ignore();

    return this.subscribers_recount(entity);
  }

  async subscribers_count(entity) {
    const count = await this.knex(this.tableSubscriber)
      .where({ [`${this.table}_id`]: entity.id })
      .count('*');

    return count[0]['count(*)'];
  }

  async subscribers_recount(entity) {
    return this.knex(this.table)
      .where({ id: entity.id })
      .update({
        subscribers_count: this.knex(this.tableSubscriber)
          .where({ [`${this.table}_id`]: entity.id })
          .count('*'),
      });
  }

  async unsubscribe(entity, subscriber) {
    await this.knex(this.tableSubscriber).delete({
      [`${this.table}_id`]: entity.id,
      subscriber_id: subscriber.id,
    });

    return this.subscribers_recount(entity);
  }
}
