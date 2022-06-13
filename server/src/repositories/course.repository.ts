import {DefaultCrudRepository, HasManyThroughRepositoryFactory, repository} from '@loopback/repository';
import {Course, CourseRelations, Student, Enrollment} from '../models';
import {inject, Getter} from '@loopback/core';
import {DbDataSource} from '../datasources';
import {EnrollmentRepository, StudentRepository} from '.';

export class CourseRepository extends DefaultCrudRepository<
  Course,
  typeof Course.prototype.id,
  CourseRelations
  > {

  public readonly hasManyStudentsThroughEnrollmentRelationName = "students";
  public readonly students: HasManyThroughRepositoryFactory<
    Student, typeof Student.prototype.id,
    Enrollment, typeof Enrollment.prototype.id
  >;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('StudentRepository') studentRepositoryGetter: Getter<StudentRepository>,
    @repository.getter('EnrollmentRepository') enrollmentRepositoryGetter: Getter<EnrollmentRepository>,
  ) {
    super(Course, dataSource);

    this.students = this.createHasManyThroughRepositoryFactoryFor(
      this.hasManyStudentsThroughEnrollmentRelationName,
      studentRepositoryGetter,
      enrollmentRepositoryGetter
    )

    this.registerInclusionResolver(
      this.hasManyStudentsThroughEnrollmentRelationName,
      this.students.inclusionResolver
    )
  }
}
