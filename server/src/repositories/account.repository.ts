import {Getter, inject} from '@loopback/core';
import {BelongsToAccessor, DefaultCrudRepository, HasManyThroughRepositoryFactory, repository} from '@loopback/repository';
import {RoleMappingRepository, RoleRepository, StudentRepository} from '.';
import {DbDataSource} from '../datasources';
import {DataSourceBindings} from '../keys';
import {Account, AccountRelations, Role, RoleMapping, Student} from '../models';

export class AccountRepository extends DefaultCrudRepository<
  Account,
  typeof Account.prototype.id,
  AccountRelations
> {

  public readonly belongsToStudentRelationName = "student";
  public readonly student: BelongsToAccessor<Student, typeof Account.prototype.id>;

  public readonly hasManyRolesThroughRoleMappingRelationName = "roles";
  public readonly roles: HasManyThroughRepositoryFactory<
    Role, typeof Role.prototype.id,
    RoleMapping, typeof Account.prototype.id
  >;

  constructor(
    @inject(DataSourceBindings.DATA_SOURCE) dataSource: DbDataSource,

    // belongsTo
    @repository.getter(StudentRepository)
    protected studentRepositoryGetter: Getter<StudentRepository>,

    // hasManyThrough
    @repository.getter(RoleRepository)
    protected roleRepositoryGetter: Getter<RoleRepository>,
    @repository.getter(RoleMappingRepository)
    protected roleMappingRepositoryGetter: Getter<RoleMappingRepository>,
  ) {
    super(Account, dataSource);

    // create belongsTo relation (Account belongs to Student).
    this.student = this.createBelongsToAccessorFor(
      this.belongsToStudentRelationName,
      studentRepositoryGetter,
    );

    // register above belongsTo relation.
    this.registerInclusionResolver(
      this.belongsToStudentRelationName,
      this.student.inclusionResolver,
    );

    // create hasManyThrough relation (Account has many Role through RoleMapping).
    this.roles = this.createHasManyThroughRepositoryFactoryFor(
      this.hasManyRolesThroughRoleMappingRelationName,
      roleRepositoryGetter,
      roleMappingRepositoryGetter,
    );

    // register above hasManyThrough relation.
    this.registerInclusionResolver(
      this.hasManyRolesThroughRoleMappingRelationName,
      this.roles.inclusionResolver,
    );
  }
}
