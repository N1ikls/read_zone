import { applyFilter } from '../query-builder.js';
import BaseStorage from './base-storage.js';
import errors from '../errors.js';
import Validator from 'validatorjs';

export default class extends BaseStorage {
  get table() {
    return 'book';
  }
  get tableAuthor() {
    return 'author';
  }
  get tableBookFandom() {
    return 'book_fandom';
  }
  get tableBookGenre() {
    return 'book_genre';
  }
  get tableBookmark() {
    return 'bookmark';
  }
  get tableBookTag() {
    return 'book_tag';
  }
  get tableFandom() {
    return 'fandom';
  }
  get tableGenre() {
    return 'genre';
  }
  get tableRater() {
    return 'book_rater';
  }
  get tableReadingHistory() {
    return 'reading_history';
  }
  get tableSocial() {
    return 'book_social';
  }
  get tableTag() {
    return 'tag';
  }
  get tableTranslator() {
    return 'user';
  }

  get publicProperties() {
    return [
      'age_rate',
      'alt_name',
      'author_id',
      'author_name',
      'background',
      'bookmark',
      'bookmarks_count',
      'chapters_count',
      'description',
      'fandoms',
      'genres',
      'id',
      'likers_count',
      'name',
      'rate',
      'reading_history_chapter_number',
      'status',
      'source_status',
      'tags',
      'translator_id',
      'translator_name',
      'type',
      'user_rate',
      'viewers_count',
      'year',
    ];
  }

  async attachFandoms(books) {
    const booksMap = {};
    for (const book of books) {
      book.fandoms = [];
      booksMap[book.id] = book;
    }

    const query = this.knex(this.tableFandom).innerJoin(
      this.tableBookFandom,
      `${this.tableBookFandom}.fandom_id`,
      `${this.tableFandom}.id`,
    );
    applyFilter(query, {
      [`${this.tableBookFandom}.book_id`]: Object.keys(booksMap),
    });
    const fandoms = await query.select([
      `${this.tableFandom}.*`,
      `${this.tableBookFandom}.book_id`,
    ]);

    for (const fandom of fandoms) {
      booksMap[fandom.book_id].fandoms.push({
        id: fandom.id,
        name: fandom.name,
      });
    }
  }

  async attachGenres(books) {
    const booksMap = {};
    for (const book of books) {
      book.genres = [];
      booksMap[book.id] = book;
    }

    const query = this.knex(this.tableGenre).innerJoin(
      this.tableBookGenre,
      `${this.tableBookGenre}.genre_id`,
      `${this.tableGenre}.id`,
    );
    applyFilter(query, {
      [`${this.tableBookGenre}.book_id`]: Object.keys(booksMap),
    });
    const genres = await query.select([
      `${this.tableGenre}.*`,
      `${this.tableBookGenre}.book_id`,
    ]);

    for (const genre of genres) {
      booksMap[genre.book_id].genres.push({ id: genre.id, name: genre.name });
    }
  }

  async attachTags(books) {
    const booksMap = {};
    for (const book of books) {
      book.tags = [];
      booksMap[book.id] = book;
    }

    const query = this.knex(this.tableTag).innerJoin(
      this.tableBookTag,
      `${this.tableBookTag}.tag_id`,
      `${this.tableTag}.id`,
    );
    applyFilter(query, {
      [`${this.tableBookTag}.book_id`]: Object.keys(booksMap),
    });
    const tags = await query.select([
      `${this.tableTag}.*`,
      `${this.tableBookTag}.book_id`,
    ]);

    for (const tag of tags) {
      booksMap[tag.book_id].tags.push({ id: tag.id, name: tag.name });
    }
  }

  beforeSave(book, actor) {
    const data = {};
    const rules = {};

    if (!book.id) {
      data.created_by = actor.id;
      data.translator_id = actor.id;
    }

    if ('alt_name' in book) {
      data.alt_name = book.alt_name?.trim() || null;
      rules.alt_name = 'string|min:1';
    }

    if ('age_rate' in book) {
      data.age_rate = book.age_rate?.trim();
      rules.age_rate = 'required|in:0,16,18';
    }

    if ('author_id' in book) {
      data.author_id = book.author_id;
      rules.author_id = 'required|integer|min:1';
    } else if (!book.id) rules.author_id = 'required|integer|min:1';

    if ('background' in book) data.background = book.background;

    if ('description' in book) {
      data.description = book.description?.trim();
      rules.description = 'string|min:3';
    }

    if ('name' in book) {
      data.name = book.name?.trim();
      rules.name = 'required|string|min:1';
    } else if (!book.id) rules.name = 'required';

    if ('source_lang' in book) {
      data.source_lang = book.source_lang?.trim();
      rules.source_lang = 'string|min:1';
    }

    if ('source_status' in book) {
      data.source_status = book.source_status?.trim();
      rules.source_status = 'in:discarded,done,frozen,progress';
    }

    if ('status' in book) {
      data.status = book.status?.trim();
      rules.status = 'required|in:discarded,done,frozen,progress';
    }

    if ('translator_id' in book) {
      data.translator_id = book.translator_id;
      rules.translator_id = 'required|integer|min:1';
    }

    if ('type' in book) {
      data.type = book.type?.trim();
      rules.type = 'required|in:original,translation,orig_fanfic,trans_fanfic';
    }

    if ('year' in book) {
      data.year = book.year || null;
      rules.year = 'integer|min:1900|max:2024';
    }

    const validator = new Validator(data, rules, {
      'required': 'Должно быть заполнено',
      'in': 'Неправильное значение',
      'min': 'Нужно больше',
      'max': 'Нужно меньше',
      'required.author_id': 'Нужно выбрать автора',
      'required.translator_id': 'Нужно выбрать переводчика',
    });

    return validator.passes() ? data : validator;
  }

  async catalogSearch(query) {
    const sort = {
      updated_at: { updated_at: 'desc' },
      updated_at_asc: { updated_at: 'asc' },
    };

    const filter = [];
    const options = {
      with: ['author', 'translator'],
    };

    if ('sort' in query) {
      if (!sort?.[query.sort])
        throw new errors.BadRequest('Нет такой сортировки');
      options.order = sort[query.sort];
    }

    if (query.types) filter.push({ type: query.types.split(',') });
    if (query.name) filter.push({ name: { like: `%${query.name}%` } });
    if (query.status) filter.push({ status: query.status });
    if (parseInt(query.ageRate)) filter.push({ age_rate: `${query.ageRate}` });
    if (query.yearFrom) filter.push({ year: { '>=': query.yearFrom } });
    if (query.yearTo) filter.push({ year: { '<=': query.yearTo } });
    if (query.chaptersFrom)
      filter.push({ chapters_count: { '>=': query.chaptersFrom } });
    if (query.chaptersTo)
      filter.push({ chapters_count: { '<=': query.chaptersTo } });
    if (query.rateFrom) filter.push({ rate: { '>=': query.rateFrom } });
    if (query.rateTo) filter.push({ rate: { '<=': query.rateTo } });
    if (query.genres) options.filterByGenres = query.genres.split(',');
    if (query.tags) options.filterByTags = query.tags.split(',');
    if (query.fandoms) options.filterByFandoms = query.fandoms.split(',');
    if (query.id) filter.push({ id: query.id });
    if (query.author_id) filter.push({ author_id: query.author_id });

    const books = await this.find(filter, options);

    await this.attachGenres(books);

    return books;
  }

  async getRateCounts(book) {
    const rates = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const rows = await this.knex(this.tableRater)
      .where('book_id', book.id)
      .groupBy('rate')
      .select(['rate', this.knex.raw('count(*) as cnt')]);

    for (const row of rows) rates[row.rate] = row.cnt;

    return rates;
  }

  async isWriteable(book, actor) {
    if (!actor) return false;
    if (actor.role === 'admin') return true;
    if (book.translator_id === actor.id) return true;

    return false;
  }

  preprocessSelectQuery(query, filter, options) {
    if (options.filterByFandoms) {
      query.innerJoin(this.tableBookFandom, (join) => {
        join
          .on(`${this.tableBookFandom}.book_id`, `${this.table}.id`)
          .onIn(`${this.tableBookFandom}.fandom_id`, options.filterByFandoms);
      });
      query.groupBy(`${this.table}.id`);
    }

    if (options.filterByGenres) {
      query.innerJoin(this.tableBookGenre, (join) => {
        join
          .on(`${this.tableBookGenre}.book_id`, `${this.table}.id`)
          .onIn(`${this.tableBookGenre}.genre_id`, options.filterByGenres);
      });
      query.groupBy(`${this.table}.id`);
    }

    if (options.filterByTags) {
      query.innerJoin(this.tableBookTag, (join) => {
        join
          .on(`${this.tableBookTag}.book_id`, `${this.table}.id`)
          .onIn(`${this.tableBookTag}.tag_id`, options.filterByTags);
      });
      query.groupBy(`${this.table}.id`);
    }

    const within = options.with || [];

    if (within.includes('author')) {
      query
        .leftJoin(
          this.tableAuthor,
          `${this.tableAuthor}.id`,
          `${this.table}.author_id`,
        )
        .select([`${this.tableAuthor}.name as author_name`]);
    }

    if (within.includes('bookmark') && options.actor) {
      query
        .leftJoin(this.tableBookmark, (join) => {
          join
            .on(`${this.tableBookmark}.${this.table}_id`, `${this.table}.id`)
            .on(`${this.tableBookmark}.user_id`, options.actor.id);
        })
        .select(`${this.tableBookmark}.type as bookmark`);
    }

    if (within.includes('translator')) {
      query
        .leftJoin(
          this.tableTranslator,
          `${this.tableTranslator}.id`,
          `${this.table}.translator_id`,
        )
        .select([`${this.tableTranslator}.name as translator_name`]);
    }

    if (within.includes('reading_history') && options.actor) {
      query
        .leftJoin(this.tableReadingHistory, (join) => {
          join
            .on(`${this.tableReadingHistory}.book_id`, `${this.table}.id`)
            .on(`${this.tableReadingHistory}.user_id`, options.actor.id);
        })
        .select([
          `${this.tableReadingHistory}.chapter_number as reading_history_chapter_number`,
        ]);
    }

    if (within.includes('user_rate') && options.actor) {
      query
        .leftJoin(this.tableRater, (join) => {
          join
            .on(`${this.tableRater}.book_id`, `${this.table}.id`)
            .on(`${this.tableRater}.rater_id`, options.actor.id);
        })
        .select(`${this.tableRater}.rate as user_rate`);
    }
  }

  async rate(book, actor, value) {
    if (value > 0) {
      await this.knex(this.tableRater)
        .insert({ book_id: book.id, rater_id: actor.id, rate: value })
        .onConflict()
        .merge();
    } else {
      await this.knex(this.tableRater)
        .where({ book_id: book.id, rater_id: actor.id })
        .delete();
    }

    return this.knex(this.table)
      .where('id', book.id)
      .update({
        rate: this.knex(this.tableRater)
          .where({ book_id: book.id })
          .select(this.knex.raw('sum(rate) / count(*)')),
      });
  }

  async save(book, actor) {
    const savedBook = await super.save(book, actor);

    await Promise.all([
      'fandoms' in book
        ? this.setFandoms(savedBook, book.fandoms, actor)
        : null,
      'genres' in book ? this.setGenres(savedBook, book.genres, actor) : null,
      'tags' in book ? this.setTags(savedBook, book.tags, actor) : null,
    ]);

    return savedBook;
  }

  async setFandoms(book, fandoms, actor) {
    const deleteFilter = [{ book_id: book.id }];

    if (fandoms.length)
      deleteFilter.push({
        fandom_id: { '!=': fandoms.map((fandom) => fandom.id) },
      });

    const deleteQuery = this.knex(this.tableBookFandom);
    applyFilter(deleteQuery, deleteFilter, this.tableBookFandom);
    await deleteQuery.delete();

    if (fandoms.length) {
      await this.knex(this.tableBookFandom)
        .insert(
          fandoms.map((fandom) => {
            return { book_id: book.id, fandom_id: fandom.id };
          }),
        )
        .onConflict()
        .merge();
    }
  }

  async setGenres(book, genres, actor) {
    const deleteFilter = [{ book_id: book.id }];

    if (genres.length)
      deleteFilter.push({
        genre_id: { '!=': genres.map((genre) => genre.id) },
      });

    const deleteQuery = this.knex(this.tableBookGenre);
    applyFilter(deleteQuery, deleteFilter, this.tableBookGenre);
    await deleteQuery.delete();

    if (genres.length) {
      await this.knex(this.tableBookGenre)
        .insert(
          genres.map((genre) => {
            return { book_id: book.id, genre_id: genre.id };
          }),
        )
        .onConflict()
        .merge();
    }
  }

  async setTags(book, tags, actor) {
    const deleteFilter = [{ book_id: book.id }];

    if (tags.length)
      deleteFilter.push({ tag_id: { '!=': tags.map((tag) => tag.id) } });

    const deleteQuery = this.knex(this.tableBookTag);
    applyFilter(deleteQuery, deleteFilter, this.tableBookTag);
    await deleteQuery.delete();

    if (tags.length) {
      await this.knex(this.tableBookTag)
        .insert(
          tags.map((tag) => {
            return { book_id: book.id, tag_id: tag.id };
          }),
        )
        .onConflict()
        .merge();
    }
  }
}
