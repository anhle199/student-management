import {DefaultCrudRepository, BelongsToAccessor, repository} from '@loopback/repository';
import {Account, AccountRelations, Student} from '../models';
import {inject, Getter} from '@loopback/core';
import {DbDataSource} from '../datasources';
import {StudentRepository} from '.';

export class AccountRepository extends DefaultCrudRepository<
  Account,
  typeof Account.prototype.id,
  AccountRelations
> {

  public readonly belongsToStudentRelationName = "student";
  public readonly student: BelongsToAccessor<Student, typeof Account.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('StudentRepository')
    protected studentRepositoryGetter: Getter<StudentRepository>,
  ) {
    super(Account, dataSource);

    this.student = this.createBelongsToAccessorFor(
      this.belongsToStudentRelationName,
      studentRepositoryGetter,
    );

    this.registerInclusionResolver(
      this.belongsToStudentRelationName,
      this.student.inclusionResolver,
    );
  }
}
