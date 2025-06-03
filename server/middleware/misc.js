import Config from '~/config/config.js'
import connectSessionKnex from 'connect-session-knex'
import Context from '~/context.class.js'
import knex from 'knex'
import Media from '~/media.js'
import session from 'express-session'
import Storage from '~/storage.js'

const db = knex(Config.knex)
const media = new Media(Config.media)
const storage = new Storage(db)
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
  cookie: {secure: false},
})

export default defineEventHandler(async event => {
  return new Promise((resolve, reject) => {
    sessionHandler(event.node.req, event.node.res, () => {
      event.context.media = media
      event.context.storage = storage
      event.context.session = event.node.req.session
      event.context.context = new Context(event.context.session, event.context.storage)
      resolve()
    })
  })
})