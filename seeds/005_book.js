import * as helper from './helper.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import csv from 'csv-parser';

export async function seed(knex) {
  const userIds = await knex('user').pluck('id');
  const authorIds = await knex('author').pluck('id');
  const fandomIds = await knex('fandom').pluck('id');
  const genreIds = await knex('genre').pluck('id');
  const tagIds = await knex('tag').pluck('id');

  const books = [];
  const fandoms = [];
  const genres = [];
  const tags = [];
  const comments = [];
  const likes = [];
  const rates = [];
  const views = [];
  const chapters = [];
  const bookmarks = [];

  // Функции для получения случайных существующих ID
  const getRandomUserId = () =>
    userIds[Math.floor(Math.random() * userIds.length)];
  const getRandomAuthorId = () =>
    authorIds[Math.floor(Math.random() * authorIds.length)];
  const getRandomFandomId = () =>
    fandomIds[Math.floor(Math.random() * fandomIds.length)];
  const getRandomGenreId = () =>
    genreIds[Math.floor(Math.random() * genreIds.length)];
  const getRandomTagId = () =>
    tagIds[Math.floor(Math.random() * tagIds.length)];

  const csvData = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream('/Users/kiforenko_na/read_zone/manga_2.csv')
      .pipe(csv())
      .on('data', (row) => csvData.push(row))
      .on('end', resolve)
      .on('error', reject);
  });

  for (let id = 1; id <= 100; id++) {
    const row = csvData[id];
    const bookUuid = uuidv4();
    const chaptersCount = helper.random(0, 30);
    const publicChaptersCount = helper.random(0, chaptersCount);
    const translatorId = getRandomUserId();

    console.log('row', row.title);

    books.push({
      id: bookUuid,
      created_by: getRandomUserId(),
      translator_id: translatorId,
      author_id: getRandomAuthorId(),
      name: row.title || `Книга ${id}`,
      alt_name: `Title ${id} name`,
      description:
        row.synopsis || helper.randomContent(`Описание книги ${id} `, 30),
      year: helper.random(1900, 2023),
      type: ['manga', 'oel', 'manhva', 'manhua', 'rumanga', 'comic'][
        helper.random(0, 5)
      ],
      release_type: [
        '4coma',
        'collection',
        'dodzinsi',
        'color',
        'single',
        'web',
        'webtoon',
      ][helper.random(0, 6)],
      status: ['discarded', 'done', 'frozen', 'progress'][helper.random(0, 3)],
      age_rate: [0, 6, 12, 16, 18][helper.random(0, 4)],
      source_lang: [
        'Японский',
        'Китайский',
        'Корейский',
        'Английский',
        'Русский',
      ][helper.random(0, 4)],
      source_status: ['discarded', 'done', 'frozen', 'progress'][
        helper.random(0, 3)
      ],
      background: row.main_picture,
      rate: row.score,
      chapters_count: chaptersCount,
      created_at: knex.fn.now(),
      updated_at: knex.fn.now(),
    });

    // Фандомы
    for (let i = 0; i < helper.random(0, 8); i++) {
      fandoms.push({ book_id: bookUuid, fandom_id: getRandomFandomId() });
    }

    // Жанры
    for (let i = 0; i < helper.random(0, 8); i++) {
      genres.push({ book_id: bookUuid, genre_id: getRandomGenreId() });
    }

    // Теги
    for (let i = 0; i < helper.random(0, 8); i++) {
      tags.push({ book_id: bookUuid, tag_id: getRandomTagId() });
    }

    const bookmarkTypes = ['process', 'discarded', 'favorite', 'planned'];

    // Закладки
    for (const book of books) {
      const bookmarksCount = helper.random(0, helper.USERS_COUNT / 2);
      for (let i = 0; i < bookmarksCount; i++) {
        const userId = getRandomUserId();

        if (
          !bookmarks.some((b) => b.book_id === book.id && b.user_id === userId)
        ) {
          bookmarks.push({
            user_id: userId,
            book_id: book.id,
            type: bookmarkTypes[helper.random(0, bookmarkTypes.length - 1)],
          });
        }
      }
    }

    // Комментарии
    const commentsCount = helper.random(0, 30);
    for (let i = 0; i < commentsCount; i++) {
      const commentId = uuidv4();

      comments.push({
        id: commentId,
        parent_id: null, // основной комментарий не имеет родителя
        book_id: bookUuid,
        created_by: getRandomUserId(),
        content: helper.randomContent(
          `Комментарий ${commentId} к книге ${id}`,
          10,
        ),
        created_at: knex.fn.now(),
      });

      // Подкомментарии
      const subcommentsCount = helper.random(0, 5);
      for (let j = 0; j < subcommentsCount; j++) {
        comments.push({
          id: uuidv4(),
          parent_id: commentId,
          book_id: bookUuid,
          created_by: getRandomUserId(),
          content: helper.randomContent(
            `Ответ на комментарий ${commentId}`,
            10,
          ),
          created_at: knex.fn.now(),
        });
      }
    }

    // Лайки
    for (let i = 0; i < helper.random(0, helper.USERS_COUNT); i++) {
      likes.push({
        book_id: bookUuid,
        liker_id: getRandomUserId(),
      });
    }

    // Оценки
    for (let i = 0; i < helper.random(0, helper.USERS_COUNT); i++) {
      rates.push({
        book_id: bookUuid,
        rater_id: getRandomUserId(),
        rate: helper.random(1, 5),
      });
    }

    // Просмотры
    for (let i = 0; i < helper.random(0, helper.USERS_COUNT); i++) {
      views.push({
        book_id: bookUuid,
        viewer_id: getRandomUserId(),
      });
    }

    // Главы
    for (let i = 0; i < chaptersCount; i++) {
      const paragraphs = [];
      for (let j = 0; j < helper.random(0, 10); j++) {
        paragraphs.push(
          helper.randomContent(`Параграф ${j} главы ${i + 1} книги ${id}`, 20),
        );
      }

      chapters.push({
        created_by: translatorId,
        book_id: bookUuid,
        number: i + 1,
        status: ['discarded', 'done', 'frozen', 'progress'][
          helper.random(0, 3)
        ],
        volume: `Том ${i}`,
        is_public: i + 1 <= publicChaptersCount,
        price: i + 1 <= publicChaptersCount ? null : helper.random(1, 999),
        name: helper.random(0, 1) ? `Название главы ${i + 1}` : null,
        content: '<p>' + paragraphs.join('</p><p>') + '</p>',
        created_at: knex.fn.now(),
        updated_at: knex.fn.now(),
      });
    }
  }

  await knex('book').insert(books).onConflict().ignore();
  await knex('book_tag').insert(tags).onConflict().ignore();
  await knex('book_fandom').insert(fandoms).onConflict().ignore();
  await knex('book_genre').insert(genres).onConflict().ignore();
  await knex('book_comment').insert(comments).onConflict().ignore();
  await knex('book_liker').insert(likes).onConflict().ignore();
  await knex('book_rater').insert(rates).onConflict().ignore();
  await knex('book_viewer').insert(views).onConflict().ignore();
  await knex('chapter').insert(chapters).onConflict().ignore();
  await knex('bookmark').insert(bookmarks).onConflict().ignore();

  await knex('book').update({
    likers_count: knex('book_liker').where('book_id', knex.raw('id')).count(),
    rate: knex('book_rater')
      .where('book_id', knex.raw('id'))
      .select(knex.raw('coalesce(sum(rate) / count(*), 0)')),
    viewers_count: knex('book_viewer').where('book_id', knex.raw('id')).count(),
    bookmarks_count: knex('bookmark')
      .where('book_id', knex.raw('id'))
      .select(knex.raw('count(*)')),
  });
}
