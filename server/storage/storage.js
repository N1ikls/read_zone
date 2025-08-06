import Author from './author';
import Book from './book';
import BookComment from './book-comment';
import Bookmark from './bookmark';
import Chapter from './chapter';
import ChapterComment from './chapter-comment';
import ChapterError from './chapter-error';
import Fandom from './fandom';
import Genre from './genre';
import News from './news';
import Notification from './notification';
import Pay from './pay';
import ReadingHistory from './reading-history';
import Tag from './tag';
import Team from './team';
import TeamComment from './team-comment';
import User from './user';

export default class Storage {
  #knex;

  #author;
  #book;
  #bookComment;
  #bookmark;
  #chapter;
  #chapterComment;
  #chapterError;
  #fandom;
  #genre;
  #news;
  #notification;
  #pay;
  #readingHistory;
  #tag;
  #team;
  #teamComment;
  #user;

  constructor(knex) {
    this.#knex = knex;
  }

  get knex() {
    return this.#knex;
  }

  get author() {
    return (this.#author ||= new Author(this.#knex));
  }
  get book() {
    return (this.#book ||= new Book(this.#knex));
  }
  get bookComment() {
    return (this.#bookComment ||= new BookComment(this.#knex));
  }
  get bookmark() {
    return (this.#bookmark ||= new Bookmark(this.#knex));
  }
  get chapter() {
    return (this.#chapter ||= new Chapter(this.#knex));
  }
  get chapterComment() {
    return (this.#chapterComment ||= new ChapterComment(this.#knex));
  }
  get chapterError() {
    return (this.#chapterError ||= new ChapterError(this.#knex));
  }
  get fandom() {
    return (this.#fandom ||= new Fandom(this.#knex));
  }
  get genre() {
    return (this.#genre ||= new Genre(this.#knex));
  }
  get news() {
    return (this.#news ||= new News(this.#knex));
  }
  get notification() {
    return (this.#notification ||= new Notification(this.#knex));
  }
  get pay() {
    return (this.#pay ||= new Pay(this.#knex));
  }
  get readingHistory() {
    return (this.#readingHistory ||= new ReadingHistory(this.#knex));
  }
  get tag() {
    return (this.#tag ||= new Tag(this.#knex));
  }
  get team() {
    return (this.#team ||= new Team(this.#knex));
  }
  get teamComment() {
    return (this.#teamComment ||= new TeamComment(this.#knex));
  }
  get user() {
    return (this.#user ||= new User(this.#knex));
  }
}
