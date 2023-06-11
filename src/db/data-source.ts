import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USERNAME,
  DATABASE_PASSWORD,
  DATABASE_NAME,
} = process.env;

export const AppDataSource = new DataSource({
  type: 'postgres',
  username: DATABASE_USERNAME,
  host: DATABASE_HOST,
  port: +DATABASE_PORT,
  password: DATABASE_PASSWORD,
  database: DATABASE_NAME,
  subscribers: [],
  entities: ['/entities/**/*{.js,.ts}'],
  migrations: ['/db/migrations/**/*{.js,.ts}'],
});
