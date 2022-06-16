import {Constructor} from '@loopback/context';
import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {DataSourceBindings} from '../keys';
import {TimestampRepositoryMixin} from '../mixins/timestamp-repository.mixin';
import {Migration, MigrationRelations} from '../models';

export class MigrationRepository extends TimestampRepositoryMixin<
  Migration,
  typeof Migration.prototype.id,
  Constructor<DefaultCrudRepository<Migration, typeof Migration.prototype.id, MigrationRelations>>
>(DefaultCrudRepository) {

  constructor(@inject(DataSourceBindings.DATA_SOURCE) dataSource: DbDataSource) {
    super(Migration, dataSource);
  }
}
