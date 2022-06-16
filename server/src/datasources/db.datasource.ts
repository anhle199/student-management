import {juggler} from '@loopback/repository';
import {inject, lifeCycleObserver, LifeCycleObserver} from '@loopback/core';
import dotenv from 'dotenv';

dotenv.config();

const config = {
  name: 'db',
  connector: 'postgresql',
  host: process.env.POSTGRES_HOST_NAME ?? 'localhost',
  port: process.env.POSTGRES_PORT ?? 5432,
  user: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres',
  database: process.env.POSTGRES_DATABASE_NAME ?? 'student_management'
}

@lifeCycleObserver('datasource')
export class DbDataSource extends juggler.DataSource
  implements LifeCycleObserver {

  static dataSourceName = 'db';
  static readonly defaultConfig = config;

  constructor(
    @inject('datasources.config.db', {optional: true})
    dsConfig: object = config
  ) {
    super(dsConfig);
  }
}
