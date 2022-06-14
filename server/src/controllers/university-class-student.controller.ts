import {repository, Filter} from '@loopback/repository';
import {param, HttpErrors, get} from '@loopback/rest';
import {UniversityClassRepository, StudentRepository} from '../repositories';
import {Student} from '../models/student.model';
import {authenticate} from '@loopback/authentication';
import {AuthenticationStrategyConstants} from '../keys';
import {authorize} from '@loopback/authorization';
import {RoleEnum} from '../models';

export class ClassStudentController {
  constructor(
    @repository("UniversityClassRepository")
    protected universityClassRepository: UniversityClassRepository,
    @repository("StudentRepository")
    protected studentRepository: StudentRepository,
  ) {}

  // TODO:
  // - student monitor must belongs to the class with the given universityClassId.
  // - teacher must teach the class with the given universityClassId.
  @authenticate(AuthenticationStrategyConstants.JWT)
  @authorize({allowedRoles: [RoleEnum.TEACHER, RoleEnum.STUDENT_MONITOR]})
  @get('/classes/{universityClassId}/students')
  async getAllStudents(
    @param.path.number('universityClassId') universityClassId: number,
    @param.filter(Student) filter?: Filter<Omit<Student, 'universityClassId'>>,
  ): Promise<Student[]> {
    const isExistedClass = await this.universityClassRepository.exists(universityClassId)
    if (!isExistedClass) {
      throw new HttpErrors.NotFound(`There is no class that \`id\` is equal to \`${universityClassId}\``)
    }

    return this.universityClassRepository.students(universityClassId).find(filter)
  }

}
