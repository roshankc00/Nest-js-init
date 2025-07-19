import { ConfigService } from '@nestjs/config';

import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

config();

const configService = new ConfigService();

export const datasourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: configService.getOrThrow('POSTGRES_HOST'),
  port: configService.getOrThrow('POSTGRES_PORT'),
  username: configService.getOrThrow('POSTGRES_USERNAME'),
  database: configService.getOrThrow('POSTGRES_DATABASE'),
  password: configService.getOrThrow('POSTGRES_PASSWORD'),
  entities: [],
  migrations: ['dist/migrations/*{.ts,.js}'],
  synchronize: false,
  subscribers: [],
  logger: 'advanced-console',
};
const dataSource = new DataSource(datasourceOptions);

export default dataSource;

// npm run migration:generate migrations/pro
// npx typeorm migration:run -d dist/typeorm.config.js
