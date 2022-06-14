import {DefaultCrudRepository} from '@loopback/repository';
import {Enrollment, EnrollmentRelations} from '../models';
import {inject} from '@loopback/core';
import {DbDataSource} from '../datasources';
import {DataSourceBindings} from '../keys';

export class EnrollmentRepository extends DefaultCrudRepository<
  Enrollment,
  typeof Enrollment.prototype.id,
  EnrollmentRelations
> {
  constructor(@inject(DataSourceBindings.DATA_SOURCE) dataSource: DbDataSource) {
    super(Enrollment, dataSource);
  }
}
