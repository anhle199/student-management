import {Getter, inject} from '@loopback/core';
import {
  BelongsToAccessor,
  DefaultCrudRepository,
  repository,
  HasOneRepositoryFactory,
  HasManyThroughRepositoryFactory,
} from '@loopback/repository';
import {DbDataSource} from '../datasources';
import {Student, StudentRelations, UniversityClass, Account, Course, Enrollment} from '../models';
import {UniversityClassRepository} from './university-class.repository';
import {AccountRepository} from './account.repository';
import {DataSourceBindings} from '../keys';
import {CourseRepository} from './course.repository';
import {EnrollmentRepository} from './enrollment.repository';

export class StudentRepository extends DefaultCrudRepository<
  Student,
  typeof Student.prototype.id,
  StudentRelations
  > {

  public readonly belongsToUniversityClassRelationName = "universityClass";
  public readonly hasOneAccountRelationName = "account";
  public readonly hasManyCoursesThroughEnrollmentRelationName = "courses";

  public readonly universityClass: BelongsToAccessor<UniversityClass, typeof Student.prototype.id>;
  public readonly account: HasOneRepositoryFactory<Account, typeof Student.prototype.id>;
  public readonly courses: HasManyThroughRepositoryFactory<
    Course, typeof Course.prototype.id,
    Enrollment, typeof Student.prototype.id
  >;

  constructor(
    @inject(DataSourceBindings.DATA_SOURCE) dataSource: DbDataSource,
    @repository.getter('UniversityClassRepository')
    protected universityClassRepositoryGetter: Getter<UniversityClassRepository>,
    @repository.getter('AccountRepository')
    protected accountRepositoryGetter: Getter<AccountRepository>,
    @repository.getter('CourseRepository')
    protected courseRepositoryGetter: Getter<CourseRepository>,
    @repository.getter('EnrollmentRepository')
    protected enrollmentRepositoryGetter: Getter<EnrollmentRepository>,
  ) {
    super(Student, dataSource);

    // create relations
    this.universityClass = this.createBelongsToAccessorFor(
      this.belongsToUniversityClassRelationName,
      universityClassRepositoryGetter,
    );
    this.account = this.createHasOneRepositoryFactoryFor(
      this.hasOneAccountRelationName,
      accountRepositoryGetter,
    );
    this.courses = this.createHasManyThroughRepositoryFactoryFor(
      this.hasManyCoursesThroughEnrollmentRelationName,
      courseRepositoryGetter,
      enrollmentRepositoryGetter,
    )

    // register relations to this repository's inclusionResolvers
    this.registerInclusionResolver(
      this.belongsToUniversityClassRelationName,
      this.universityClass.inclusionResolver,
    );
    this.registerInclusionResolver(
      this.hasOneAccountRelationName,
      this.account.inclusionResolver,
    );
    this.registerInclusionResolver(
      this.hasManyCoursesThroughEnrollmentRelationName,
      this.courses.inclusionResolver,
    )
  }
}
