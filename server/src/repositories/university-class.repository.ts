import {DefaultCrudRepository, HasManyRepositoryFactory, repository} from '@loopback/repository';
import {UniversityClass, UniversityClassRelations, Student} from '../models';
import {DbDataSource} from '../datasources';
import {inject, Getter} from '@loopback/core';
import {StudentRepository} from './student.repository';

export class UniversityClassRepository extends DefaultCrudRepository<
  UniversityClass,
  typeof UniversityClass.prototype.id,
  UniversityClassRelations
> {

  public readonly hasManyStudentsRelationName = "students";
  public readonly students: HasManyRepositoryFactory<Student, typeof UniversityClass.prototype.id>;

  constructor(
    @inject('datasources.db') dataSource: DbDataSource,
    @repository.getter('StudentRepository') protected studentRepositoryGetter: Getter<StudentRepository>,
  ) {
    super(UniversityClass, dataSource);

    // create hasMany constrained relation
    this.students = this.createHasManyRepositoryFactoryFor(
      this.hasManyStudentsRelationName,
      studentRepositoryGetter
    );

    // register `hasManyStudentsRelationName` relation to this repository's inclusionResolver
    this.registerInclusionResolver(
      this.hasManyStudentsRelationName,
      this.students.inclusionResolver
    );
  }
}
