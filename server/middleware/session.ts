import knex from 'knex';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore
import { getServerSession } from '#auth';
import Media from '../media';
import Storage from '../storage';
import Context from '../context';

const __dirname = dirname(fileURLToPath(import.meta.url));

const db = knex({
  client: 'pg',
  connection: {
    port: 5432,
    host: '127.0.0.1',
    user: 'kiforenko_na',
    database: 'my_database',
  },
  migrations: {
    directory: __dirname + '/../migrations',
  },
  seeds: {
    directory: __dirname + '/../seeds',
  },
});

const media = new Media({
  uploads: {
    path: __dirname + '/../public/upload',
  },
});

const storage = new Storage(db);

export default defineEventHandler(async (event) => {
  const session = await getServerSession(event);

  event.context.media = media;
  event.context.storage = storage;
  event.context.session = session;

  event.context.context = new Context(
    event.context.session,
    event.context.storage,
  );
});
