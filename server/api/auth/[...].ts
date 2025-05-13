// // @ts-ignore
// import { NuxtAuthHandler } from '#auth';
// import Credentials from '@auth/core/providers/credentials';
// import knex from 'knex';
// import { dirname } from 'path';
// import { fileURLToPath } from 'url';
// import bcrypt from 'bcrypt';

// const __dirname = dirname(fileURLToPath(import.meta.url));

// const db = knex({
//   client: 'pg',
//   connection: {
//     port: 5432,
//     host: '127.0.0.1',
//     user: 'kiforenko_na',
//     database: 'db_test',
//   },
//   migrations: {
//     directory: __dirname + '/../migrations',
//   },
//   seeds: {
//     directory: __dirname + '/../seeds',
//   },
// });

// export default NuxtAuthHandler({
//   secret: 'asdf1234',
//   providers: [
//     Credentials({
//       name: 'credentials',
//       credentials: {
//         email: { label: 'Username', type: 'text' },
//         password: { label: 'Password', type: 'password' },
//       },
//       async authorize(credentials) {
//         const user = await db('user')
//           .where({ email: credentials.email })
//           .select('*');

//         if (!bcrypt.compareSync(credentials.password, user[0].password))
//           return null;

//         return user[0];
//       },
//     }),
//   ],
//   session: {
//     strategy: 'jwt',
//   },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) {
//         token.id = user.id;
//         token.role = user.role;
//       }
//       return token;
//     },
//     async session({ session, token }) {
//       if (token?.id) {
//         session.user = {
//           ...session.user,
//           id: token.id,
//           role: token.role,
//         };
//       }
//       return session;
//     },
//   },
// });
