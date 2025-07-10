import { db } from '../../config';
import connectSessionKnex from 'connect-session-knex';
import Context from '../utils/context';
import session from 'express-session';
import Storage from '../storage/storage';

const storage = new Storage(db);
const sessionHandler = session({
  name: 'session',
  store: new (connectSessionKnex(session))({
    knex: db,
    tablename: 'sessions',
    createtable: true,
  }),
  secret: process.env.SESSION_SECRET || 'asdf1234',
  resave: false,
  rolling: true,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' },
});

export default defineEventHandler(async (event) => {
  return new Promise<void>((resolve, reject) => {
    sessionHandler(event.node.req, event.node.res, (err) => {
      event.context.storage = storage;
      event.context.session = event.node.req.session;
      event.context.context = new Context(
        event.context.session,
        event.context.storage,
      );
      resolve();
    });
  });
});
