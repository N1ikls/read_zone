// @ts-ignore
import { NuxtAuthHandler } from '#auth';
import Credentials from '@auth/core/providers/credentials';
import knex from 'knex';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

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

export default NuxtAuthHandler({
  secret: 'asdf1234',
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const user = await db('users')
          .where({ username: credentials.username })
          .first();

        if (user && credentials.password === user.password) {
          return {
            id: user.id,
            name: user.username,
            email: user.email,
          };
        }

        return null;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
});
