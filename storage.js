import Author from './storage/author.js'
import Book from './storage/book.js'
import BookComment from './storage/book-comment.js'
import Bookmark from './storage/bookmark.js'
import Chapter from './storage/chapter.js'
import ChapterComment from './storage/chapter-comment.js'
import ChapterError from './storage/chapter-error.js'
import Fandom from './storage/fandom.js'
import Genre from './storage/genre.js'
import News from './storage/news.js'
import Pay from './storage/pay.js'
import ReadingHistory from './storage/reading-history.js'
import Tag from './storage/tag.js'
import Team from './storage/team.js'
import TeamComment from './storage/team-comment.js'
import User from './storage/user.js'

export default class Storage {
  #knex

  #author
  #book
  #bookComment
  #bookmark
  #chapter
  #chapterComment
  #chapterError
  #fandom
  #genre
  #news
  #pay
  #readingHistory
  #tag
  #team
  #teamComment
  #user

  constructor(knex) {
    this.#knex = knex
  }

  get author() { return this.#author ||= new Author(this.#knex) }
  get book() { return this.#book ||= new Book(this.#knex) }
  get bookComment() { return this.#bookComment ||= new BookComment(this.#knex) }
  get bookmark() { return this.#bookmark ||= new Bookmark(this.#knex) }
  get chapter() { return this.#chapter ||= new Chapter(this.#knex) }
  get chapterComment() { return this.#chapterComment ||= new ChapterComment(this.#knex) }
  get chapterError() { return this.#chapterError ||= new ChapterError(this.#knex) }
  get fandom() { return this.#fandom ||= new Fandom(this.#knex) }
  get genre() { return this.#genre ||= new Genre(this.#knex) }
  get news() { return this.#news ||= new News(this.#knex) }
  get pay() { return this.#pay ||= new Pay(this.#knex) }
  get readingHistory() { return this.#readingHistory ||= new ReadingHistory(this.#knex) }
  get tag() { return this.#tag ||= new Tag(this.#knex) }
  get team() { return this.#team ||= new Team(this.#knex) }
  get teamComment() { return this.#teamComment ||= new TeamComment(this.#knex) }
  get user() { return this.#user ||= new User(this.#knex) }
}