import knex from 'knex';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
// @ts-ignore
import connectSessionKnex from 'connect-session-knex';
import session from 'express-session';

const __dirname = dirname(fileURLToPath(import.meta.url));

const db = knex({
  client: 'pg',
  connection: {
    port: 5432,
    host: '127.0.0.1',
    user: 'kiforenko_na',
    database: 'db_test',
  },
  migrations: {
    directory: __dirname + '/../migrations',
  },
  seeds: {
    directory: __dirname + '/../seeds',
  },
});

const sessionHandler = session({
  name: 'session',
  store: new (connectSessionKnex(session))({
    knex: db,
    tablename: 'session',
    createtable: true,
  }),
  secret: 'asdf1234',
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: { secure: false },
});

export default defineEventHandler(async (event) => {
  return new Promise((resolve, reject) => {
    sessionHandler(event.node.req, event.node.res, () => {
      event.context.session = event.node.req.session;

      resolve();
    });
  });
});
