import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {DataSourceBindings} from '../keys';
import {RoleMapping, RoleMappingRelations} from '../models';

export class RoleMappingRepository extends DefaultCrudRepository<
  RoleMapping,
  typeof RoleMapping.prototype.id,
  RoleMappingRelations
> {
  constructor(@inject(DataSourceBindings.DATA_SOURCE) dataSource: DbDataSource) {
    super(RoleMapping, dataSource);
  }
}
