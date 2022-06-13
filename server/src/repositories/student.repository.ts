import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Student, StudentRelations, UniversityClass, Account} from '../models';
import {UniversityClassRepository} from './university-class.repository';
import {AccountRepository} from './account.repository';

export class StudentRepository extends DefaultCrudRepository<
  Student,
  typeof Student.prototype.id,
  StudentRelations
  > {

  public readonly belongsToUniversityClassRelationName = "universityClass";
  public readonly universityClass: BelongsToAccessor<UniversityClass, typeof Student.prototype.id>;

  public readonly hasOneAccountRelationName = "account";
  public readonly account: HasOneRepositoryFactory<Account, typeof Student.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('UniversityClassRepository')
    protected universityClassRepositoryGetter: Getter<UniversityClassRepository>,
    @repository.getter('AccountRepository')
    protected accountRepositoryGetter: Getter<AccountRepository>,
  ) {
    super(Student, dataSource);

    // create belongsTo constrained relation
    this.universityClass = this.createBelongsToAccessorFor(
      this.belongsToUniversityClassRelationName,
      universityClassRepositoryGetter,
    );

    // register `belongsToUniversityClassRelationName` relation to this repository's inclusionResolver
    this.registerInclusionResolver(
      this.belongsToUniversityClassRelationName,
      this.universityClass.inclusionResolver,
    );

    this.account = this.createHasOneRepositoryFactoryFor(
      this.hasOneAccountRelationName,
      accountRepositoryGetter,
    );

    this.registerInclusionResolver(
      this.hasOneAccountRelationName,
      this.account.inclusionResolver,
    );
  }
}
