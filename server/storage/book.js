import { applyFilter } from '../utils/query-builder.js';
import BaseStorage from './base-storage.js';
import errors from '../utils/errors.js';
import Validator from 'validatorjs';
import searchLogger from '../utils/search-logger.js';
import NotificationHelper from '../utils/notification-helper.js';

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
      'cover',
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
      'created_at',
    ];
  }

  afterFetch(book) {
    if (book.year) book.year = Number(book.year);

    // Добавляем поле cover как алиас для background для обратной совместимости
    if (book.background && !book.cover) {
      book.cover = book.background;
    }

    return book;
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
      data.age_rate =
        typeof book.age_rate === 'string'
          ? book.age_rate.trim()
          : book.age_rate;
      rules.age_rate = 'required|in:0,16,18';
    }

    if ('author_id' in book) {
      data.author_id = book.author_id;
      rules.author_id = 'required|string';
    } else if (!book.id) rules.author_id = 'required|string';

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
      rules.translator_id = 'required|string';
    }

    if ('type' in book) {
      data.type = book.type?.trim();
      rules.type = 'required|in:manga,oel,manhva,manhua,rumanga,comic';
    }

    if ('release_type' in book) {
      data.release_type = book.release_type?.trim();
      rules.release_type =
        'required|in:4coma,collection,dodzinsi,color,single,web,webtoon';
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

  /**
   * Нормализует поисковый запрос для улучшения качества поиска манги
   * Обрабатывает диакритические знаки, транслитерацию и другие edge cases
   * @param {string} searchTerm - исходный поисковый запрос
   * @returns {string} нормализованный запрос
   */
  normalizeSearchTerm(searchTerm) {
    if (!searchTerm || typeof searchTerm !== 'string') return '';

    return (
      searchTerm
        .trim() // удаляем пробелы в начале и конце
        .replace(/\s+/g, ' ') // заменяем множественные пробелы на одинарные
        .toLowerCase() // приводим к нижнему регистру
        // Нормализация русских букв
        .replace(/ё/g, 'е') // ё -> е
        .replace(/й/g, 'и') // й -> и (опционально)
        // Удаление специальных символов и знаков препинания
        .replace(/[^\w\s\u0400-\u04FF]/g, ' ') // оставляем только буквы, цифры, пробелы и кириллицу
        .replace(/\s+/g, ' ') // снова нормализуем пробелы после удаления символов
        .trim()
    );
  }

  /**
   * Создает условие для полнотекстового поиска манги с поддержкой различных стратегий
   * @param {string} searchTerm - поисковый запрос
   * @param {string} field - поле для поиска (название манги, описание и т.д.)
   * @returns {object} условие для фильтрации
   */
  createSearchCondition(
    searchTerm,
    field = 'name',
    includeAuthorSearch = null,
  ) {
    const normalizedTerm = this.normalizeSearchTerm(searchTerm);

    if (!normalizedTerm) return null;

    // Разбиваем на отдельные слова для поиска по каждому
    const words = normalizedTerm.split(' ').filter((word) => word.length > 0);

    if (words.length === 0) return null;

    // Создаем условие для поиска с использованием ILIKE (case-insensitive)
    // и поиска по каждому слову отдельно
    const searchCondition = {
      ':or': [
        // Точное совпадение (высший приоритет)
        { [field]: { ilike: normalizedTerm } },
        // Поиск как подстроки
        { [field]: { ilike: `%${normalizedTerm}%` } },
        // Поиск по отдельным словам (все слова должны присутствовать)
        ...(words.length > 1
          ? [
              {
                ':and': words.map((word) => ({
                  [field]: { ilike: `%${word}%` },
                })),
              },
            ]
          : []),
      ],
    };

    // Добавляем поиск по автору если указан
    if (includeAuthorSearch) {
      searchCondition[':or'].push({
        'author.name': { ilike: `%${includeAuthorSearch}%` },
      });
    }

    return searchCondition;
  }

  /**
   * Создает расширенное условие поиска с поддержкой fuzzy search
   * Использует PostgreSQL возможности для поиска с опечатками
   * @param {string} searchTerm - поисковый запрос
   * @param {string} field - поле для поиска
   * @param {string} includeAuthorSearch - поиск по автору
   * @returns {object} условие для фильтрации с fuzzy search
   */
  createFuzzySearchCondition(
    searchTerm,
    field = 'name',
    includeAuthorSearch = null,
  ) {
    const normalizedTerm = this.normalizeSearchTerm(searchTerm);

    if (!normalizedTerm || normalizedTerm.length < 3) {
      // Для коротких запросов используем обычный поиск
      return this.createSearchCondition(searchTerm, field, includeAuthorSearch);
    }

    const words = normalizedTerm.split(' ').filter((word) => word.length > 2);

    if (words.length === 0) return null;

    // Создаем условие с поддержкой fuzzy search
    const searchCondition = {
      ':or': [
        // Точное совпадение (высший приоритет)
        { [field]: { ilike: normalizedTerm } },
        // Поиск как подстроки
        { [field]: { ilike: `%${normalizedTerm}%` } },
        // Поиск по отдельным словам
        ...(words.length > 1
          ? [
              {
                ':and': words.map((word) => ({
                  [field]: { ilike: `%${word}%` },
                })),
              },
            ]
          : []),
      ],
    };

    // Добавляем поиск по автору если указан
    if (includeAuthorSearch) {
      searchCondition[':or'].push({
        'author.name': { ilike: `%${includeAuthorSearch}%` },
      });
    }

    return searchCondition;
  }

  async catalogSearch(query) {
    const startTime = Date.now();
    const originalQuery = query.name;
    const normalizedQuery = originalQuery
      ? this.normalizeSearchTerm(originalQuery)
      : null;

    const sort = {
      updated_at: { updated_at: 'desc' },
      updated_at_asc: { updated_at: 'asc' },
      relevance: { relevance: 'desc' }, // добавляем сортировку по релевантности
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

    // Улучшенный поиск по названию манги
    if (query.name) {
      // Включаем поиск по автору если не указан отдельно
      const includeAuthorSearch = !query.author_id
        ? this.normalizeSearchTerm(query.name)
        : null;
      const searchCondition = this.createSearchCondition(
        query.name,
        'name',
        includeAuthorSearch,
      );
      if (searchCondition) {
        filter.push(searchCondition);
      }
    }

    if (query.status && query.status !== 'all')
      filter.push({ status: query.status });
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
    if (query.translator_id)
      filter.push({ translator_id: query.translator_id });

    const books = await this.find(filter, options);

    await this.attachGenres(books);

    // Логируем поисковый запрос для мониторинга производительности
    if (originalQuery) {
      const executionTime = Date.now() - startTime;
      searchLogger.logSearch({
        query: originalQuery,
        normalizedQuery,
        resultCount: books.length,
        executionTime,
        timestamp: new Date(),
      });
    }

    return books;
  }

  async getRateCounts(id) {
    const rates = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const rows = await this.knex(this.tableRater)
      .where('book_id', id)
      .groupBy('rate')
      .select(['rate', this.knex.raw('count(*) as cnt')]);

    for (const row of rows) rates[row.rate] = Number(row.cnt);

    return rates;
  }

  async isWriteable(book, actor) {
    if (!actor) return false;
    if (actor.role === 'admin') return true;
    if (book.translator_id === actor.id) return true;

    return false;
  }

  // Получение новинок с ротацией
  async getNovelties(offset = 0, limit = 6) {
    // Дата 7 дней назад
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Базовый запрос для новинок за последние 7 дней
    const baseQuery = this.knex(this.table)
      .where(`${this.table}.created_at`, '>=', weekAgo)
      .whereIn(`${this.table}.status`, ['progress', 'done']) // published статусы
      .where(function () {
        // Подзапрос для проверки наличия хотя бы одной опубликованной главы
        this.whereExists(function () {
          this.select('*')
            .from('chapter')
            .whereRaw('chapter.book_id = book.id')
            .where(function () {
              this.where('status', 'done').orWhere('is_public', true);
            });
        });
      })
      .orderBy(`${this.table}.created_at`, 'desc');

    // Получаем общее количество новинок (без ORDER BY для count)
    const countQuery = this.knex(this.table)
      .where(`${this.table}.created_at`, '>=', weekAgo)
      .whereIn(`${this.table}.status`, ['progress', 'done'])
      .where(function () {
        this.whereExists(function () {
          this.select('*')
            .from('chapter')
            .whereRaw('chapter.book_id = book.id')
            .where(function () {
              this.where('status', 'done').orWhere('is_public', true);
            });
        });
      });

    const totalCount = await countQuery.count('* as count').first();
    const total = parseInt(totalCount.count) || 0;

    if (total === 0) {
      return {
        books: [],
        total: 0,
        offset: 0,
        hasMore: false,
      };
    }

    // Циклическая ротация: если offset больше общего количества, начинаем сначала
    const normalizedOffset = offset % total;

    // Получаем книги с учетом ротации
    const books = await baseQuery
      .clone()
      .offset(normalizedOffset)
      .limit(limit)
      .select([`${this.table}.*`, `${this.tableAuthor}.name as author_name`])
      .leftJoin(
        this.tableAuthor,
        `${this.tableAuthor}.id`,
        `${this.table}.author_id`,
      );

    // Циклическое заполнение теперь контролируется RotationManager
    // Убираем старую логику циклического заполнения

    // Обрабатываем книги через afterFetch для правильной обработки полей
    const processedBooks = books.map((book) => this.afterFetch({ ...book }));

    // Прикрепляем жанры
    await this.attachGenres(processedBooks);

    return {
      books: processedBooks,
      total,
      offset: normalizedOffset,
      hasMore: total > limit,
      nextOffset: (normalizedOffset + limit) % total,
    };
  }

  preprocessSelectQuery(query, filter, options) {
    let isGrouped = false;
    if (options.filterByFandoms) {
      query.innerJoin(this.tableBookFandom, (join) => {
        join
          .on(`${this.tableBookFandom}.book_id`, `${this.table}.id`)
          .onIn(`${this.tableBookFandom}.fandom_id`, options.filterByFandoms);
      });
      query.groupBy(`${this.table}.id`);
      isGrouped = true;
    }

    if (options.filterByGenres) {
      query.innerJoin(this.tableBookGenre, (join) => {
        join
          .on(`${this.tableBookGenre}.book_id`, `${this.table}.id`)
          .onIn(`${this.tableBookGenre}.genre_id`, options.filterByGenres);
      });
      query.groupBy(`${this.table}.id`);
      isGrouped = true;
    }

    if (options.filterByTags) {
      query.innerJoin(this.tableBookTag, (join) => {
        join
          .on(`${this.tableBookTag}.book_id`, `${this.table}.id`)
          .onIn(`${this.tableBookTag}.tag_id`, options.filterByTags);
      });
      query.groupBy(`${this.table}.id`);
      isGrouped = true;
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
      if (isGrouped) {
        // Если уже был groupBy по book.id из фильтров-пивотов, добавим недостающие поля
        query.groupBy([`${this.tableAuthor}.name`]);
      }
    }

    // Поиск по автору теперь включен в основное поисковое условие
    // Старая логика удалена для избежания конфликтов

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
      if (isGrouped) {
        query.groupBy([`${this.tableTranslator}.name`]);
      }
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
        .onConflict(['book_id', 'rater_id'])
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

  async postStatus(bookId, actor, status) {
    const book = await this.findOne({ id: bookId });

    if (!book) {
      throw new errors.NotFound('Книга не найдена');
    }

    if (actor.role !== 'admin' && book.author_id !== actor.id) {
      throw new errors.Forbidden('Нет прав для обновления статуса');
    }

    const oldStatus = book.status;

    await this.knex(this.table).where('id', bookId).update({
      status,
      updated_by: actor.id,
      updated_at: this.knex.fn.now(),
    });

    // Создаем уведомления об изменении статуса
    if (oldStatus !== status) {
      try {
        const notificationHelper = new NotificationHelper({
          user: { knex: this.knex },
          notification: {
            createBulk: async (notifications) => {
              return await this.knex('notifications').insert(notifications);
            },
          },
        });

        // Получаем автора
        const author = await this.knex('user')
          .where('id', book.author_id)
          .first();

        if (author) {
          await notificationHelper.notifyBookStatusChange(
            book,
            author,
            oldStatus,
            status,
          );
        }
      } catch (error) {
        console.error(
          'Ошибка при создании уведомлений об изменении статуса:',
          error,
        );
      }
    }
  }

  async save(book, actor) {
    const isNewBook = !book.id;
    const savedBook = await super.save(book, actor);

    await Promise.all([
      'fandoms' in book
        ? this.setFandoms(savedBook, book.fandoms, actor)
        : null,
      'genres' in book ? this.setGenres(savedBook, book.genres, actor) : null,
      'tags' in book ? this.setTags(savedBook, book.tags, actor) : null,
    ]);

    // Создаем уведомления для новой книги
    if (isNewBook && savedBook.status === 'published') {
      try {
        const notificationHelper = new NotificationHelper(
          this.knex.storage || {
            user: this.knex.user,
            notification: this.knex.notification,
          },
        );

        // Получаем автора
        const author = await this.knex('user')
          .where('id', savedBook.author_id)
          .first();
        if (author) {
          await notificationHelper.notifyNewBook(savedBook, author);
        }
      } catch (error) {
        console.error('Ошибка при создании уведомлений о новой книге:', error);
      }
    }

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
        .onConflict(['book_id', 'fandom_id'])
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
        .onConflict(['book_id', 'genre_id'])
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
        .onConflict(['book_id', 'tag_id'])
        .merge();
    }
  }

  async getTags(bookId) {
    const tags = await this.knex(this.tableTag)
      .innerJoin(
        this.tableBookTag,
        `${this.tableBookTag}.tag_id`,
        `${this.tableTag}.id`,
      )
      .where(`${this.tableBookTag}.book_id`, bookId)
      .select(`${this.tableTag}.*`);

    return tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      // другие нужные поля тега
    }));
  }

  async updateTypographySettings(bookId, settings) {
    // Сохраняем настройки типографики в JSON поле в таблице book
    // Или можно создать отдельную таблицу book_typography_settings
    await this.knex(this.table)
      .where('id', bookId)
      .update({
        typography_settings: JSON.stringify(settings),
        updated_at: this.knex.fn.now(),
      });

    return settings;
  }

  async getTypographySettings(bookId) {
    const book = await this.knex(this.table)
      .where('id', bookId)
      .select('typography_settings')
      .first();

    if (book && book.typography_settings) {
      try {
        return JSON.parse(book.typography_settings);
      } catch (error) {
        console.error('Ошибка парсинга настроек типографики:', error);
        return null;
      }
    }

    return null;
  }
}
