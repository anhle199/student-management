import {DefaultCrudRepository} from '@loopback/repository';
import {Enrollment, EnrollmentRelations} from '../models';
import {inject} from '@loopback/core';
import {DbDataSource} from '../datasources';

export class EnrollmentRepository extends DefaultCrudRepository<
  Enrollment,
  typeof Enrollment.prototype.id,
  EnrollmentRelations
> {
  constructor(@inject('datasources.db') dataSource: DbDataSource) {
    super(Enrollment, dataSource);
  }
}
