import knex from 'knex';
import { databaseConfig } from './database.js';

export const db = knex(databaseConfig);
