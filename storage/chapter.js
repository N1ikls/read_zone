import BaseStorage from './base-storage.js';
import knex from 'knex';
import errors from '../errors.js';

export default class extends BaseStorage {
  get table() {
    return 'chapter';
  }
  get tableLiker() {
    return 'chapter_liker';
  }
  get tableBuyer() {
    return 'chapter_buyer';
  }
  get tableViewer() {
    return 'chapter_viewer';
  }

  get publicProperties() {
    return [
      'book_id',
      'number',
      'name',
      'is_public',
      'is_readable',
      'price',
      'volume',
      'status',
      'created_at',
      'updated_at',
      'likers_count',
      'viewers_count',
    ];
  }

  afterFetch(chapter) {
    chapter.is_public = chapter.is_public != 0;

    if ('is_readable' in chapter)
      chapter.is_readable = chapter.is_readable != 0;

    return chapter;
  }

  async isReadable(chapter, actor) {
    if ('is_readable' in chapter) return chapter.is_readable;

    if (chapter.is_public) return true;
    if (!actor) return false;
    if (actor.role === 'admin') return true;
    if (chapter.created_by === actor.id) return true;

    const buyerRows = await this.knex(this.tableBuyer)
      .where('chapter_id', chapter.id)
      .where('user_id', actor.id)
      .where(this.knex.raw(`${this.tableBuyer}.start_time <= NOW()`))
      .where((builder) => {
        builder
          .where(this.knex.raw(`${this.tableBuyer}.end_time >= NOW()`))
          .orWhere(this.knex.raw(`${this.tableBuyer}.end_time IS NULL`));
      })
      .select('*');
    if (buyerRows.length) return true;

    return false;
  }

  preprocessSelectQuery(query, filter, options) {
    const within = options?.with || [];

    if (within.includes('is_readable') && options.actor) {
      query
        .leftJoin(this.tableBuyer, (join) => {
          join
            .on(`${this.tableBuyer}.chapter_id`, `${this.table}.id`)
            .on(`${this.tableBuyer}.user_id`, options.actor.id)
            .on(this.knex.raw(`${this.tableBuyer}.start_time <= NOW()`))
            .on((join) => {
              join
                .on(this.knex.raw(`${this.tableBuyer}.end_time >= NOW()`))
                .orOn(this.knex.raw(`${this.tableBuyer}.end_time IS NULL`));
            });
        })
        .select(`${this.tableBuyer}.user_id`)
        .select(
          this.knex.raw(
            `if (${this.table}.is_public, 1, if (${this.tableBuyer}.user_id = ${options.actor.id}, 1, 0)) as is_readable`,
          ),
        );
    }
  }

  async likeChapter(chapter, user, book_id) {
    await this.knex(this.tableLiker)
      .insert({
        chapter_id: chapter.id,
        liker_id: user.id,
      })
      .onConflict(['chapter_id', 'liker_id'])
      .ignore();

    await this.likers_recount(chapter);

    const result = await this.knex('chapter_liker')
      .join('chapter', 'chapter.id', 'chapter_liker.chapter_id')
      .where('chapter.book_id', book_id)
      .count()
      .first();

    await this.knex('book').where('id', book_id).update({
      likers_count: result.count,
    });

    return await this.likers_count({ id: chapter.id }, true);
  }

  async getLiked(chapter_ids, user) {
    const liked = await this.knex(this.tableLiker)
      .whereIn('chapter_id', chapter_ids)
      .andWhere('liker_id', user.id);

    return Object.fromEntries(liked.map((r) => [r.chapter_id, true]));
  }

  async postBlocked(number, is_public, actor) {
    await this.knex(this.table).where('number', number).update({
      is_public,
      updated_at: this.knex.fn.now(),
      updated_by: actor.id,
    });
  }

  toReadable(chapter) {
    const data = this.toPublic(chapter);
    data.content = chapter.content;

    return data;
  }
}
