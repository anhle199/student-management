import { repository, Filter } from '@loopback/repository';
import { param, HttpErrors, get } from '@loopback/rest';
import { UniversityClassRepository, StudentRepository } from '../repositories';
import { Student } from '../models/student.model';
import { authenticate } from '@loopback/authentication';
import { AuthenticationStrategyConstants } from '../keys';
import { authorize } from '@loopback/authorization';
import { RoleEnum } from '../models';
import { verifyStudentBelongsToClassVoter } from '../services';

export class ClassStudentController {
  constructor(
    @repository(UniversityClassRepository)
    protected universityClassRepository: UniversityClassRepository,
    @repository(StudentRepository)
    protected studentRepository: StudentRepository,
  ) {}

  // TODO:
  // - teacher must teach the class with the given id (class).
  @authenticate(AuthenticationStrategyConstants.JWT)
  @authorize({
    allowedRoles: [RoleEnum.ADMIN, RoleEnum.TEACHER, RoleEnum.STUDENT_MONITOR],
    voters: [verifyStudentBelongsToClassVoter],
  })
  @get('/classes/{id}/students')
  async getAllStudents(
    @param.path.number('id') id: number,
    @param.filter(Student) filter?: Filter<Omit<Student, 'universityClassId'>>,
  ): Promise<Student[]> {
    const isExistedClass = await this.universityClassRepository.exists(id);
    if (!isExistedClass) {
      throw new HttpErrors.NotFound('Class not found.');
    }

    return this.universityClassRepository.students(id).find(filter);
  }
}
