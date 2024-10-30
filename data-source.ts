import { DataSource } from 'typeorm';
import { V1Url } from './src/v1/db/url.entity';

export const AppDataSource = new DataSource({
  type: 'sqlite',
  database: 'database.sqlite',
  entities: ['src/**/db/*.entity.ts'],
  migrations: ['migration/**/*.ts'],
  synchronize: false,
});
