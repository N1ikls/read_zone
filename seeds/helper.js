import { v4 as uuidv4 } from 'uuid';

export const ADMINS_COUNT = 2;
export const AUTHORS_COUNT = 30;
export const BOOKS_COUNT = 100;
export const FANDOMS_COUNT = 20;
export const FAQ_COUNT = 10;
export const GENRES_COUNT = 20;
export const NEWS_COUNT = 30;
export const TAGS_COUNT = 20;
export const TEAMS_COUNT = 10;
export const USERS_COUNT = 50;

export function random(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function randomAuthorId() {
  return uuidv4();
  return random(1, AUTHORS_COUNT);
}

export function randomFandomId() {
  return uuidv4();
  return random(1, FANDOMS_COUNT);
}

export function randomGenreId() {
  return uuidv4();
  return random(1, GENRES_COUNT);
}

export function randomTagId() {
  return uuidv4();
  return random(1, TAGS_COUNT);
}

export function randomContent(part, maxCount) {
  const count = random(1, maxCount);
  const parts = [];

  for (let i = 0; i < count; i++) parts.push(part);

  return parts.join('. ');
}

export function randomDate(from, to) {
  const min = new Date(from).getTime();
  const max = new Date(to).getTime();

  const date = new Date();
  date.setTime(random(min, max));

  return date;
}

export function randomUserId() {
  return uuidv4();
}

// DUMMY
export async function seed(knex) {}
