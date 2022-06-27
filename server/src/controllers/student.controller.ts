import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {Count, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from '@loopback/rest';
import {AuthenticationStrategyConstants} from '../keys';
import {RoleEnum, Student} from '../models';
import {AccountRepository, StudentRepository} from '../repositories';

const topLevelRoles = [RoleEnum.ADMIN];

@authenticate(AuthenticationStrategyConstants.JWT)
@authorize({allowedRoles: topLevelRoles})
export class StudentController {
  constructor(
    @repository(AccountRepository) protected accountRepository: AccountRepository,
    @repository(StudentRepository) protected studentRepository: StudentRepository
  ) {}

  @post('/students')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Student, {
            title: 'NewStudent',
            optional: ['universityClassId'],
          })
        }
      }
    })
    student: Student
  ): Promise<Student> {
    // Conflict condition: students who have the same `id` or `phone` with these given values.

    // Create where condition statement to find students that satisfy the above condition.
    const whereStatement = {where: {}};
    if (student.phone) {
      whereStatement.where = {
        or: [
          {id: student.id},
          {phone: student.phone},
        ],
      }
    } else {
      whereStatement.where = {id: student.id}
    }

    // Find students that satisfy the above condition.
    const existedStudents = await this.studentRepository.find(whereStatement)
    if (existedStudents.length !== 0) {
      throw new HttpErrors.Conflict("Duplicate property `id` or `phone`")
    }

    return this.studentRepository.create(student);
  }

  @authorize({
    allowedRoles: [
      ...topLevelRoles,
      RoleEnum.TEACHER,
      RoleEnum.STUDENT_MONITOR
    ]
  })
  @get('/students')
  async find(
    @param.filter(Student) filter?: Filter<Student>
  ): Promise<Student[]> {
    return this.studentRepository.find(filter);
  }

  @authorize({
    allowedRoles: [
      ...topLevelRoles,
      RoleEnum.TEACHER,
      RoleEnum.STUDENT_MONITOR,
      RoleEnum.STUDENT_MEMBER
    ]
  })
  @get('/students/{id}')
  async findById(
    @param.path.string('id') id: string,
    @param.filter(Student, {exclude: 'where'}) filter?: FilterExcludingWhere<Student>
  ): Promise<Student> {
    return this.studentRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [
      ...topLevelRoles,
      RoleEnum.TEACHER,
      RoleEnum.STUDENT_MONITOR
    ]
  })
  @get('/students/count')
  async count(@param.where(Student) where?: Where<Student>): Promise<Count> {
    return this.studentRepository.count(where);
  }

  @authorize({
    allowedRoles: [
      ...topLevelRoles,
      RoleEnum.TEACHER,
      RoleEnum.STUDENT_MEMBER
    ]
  })
  @patch('/students/{id}')
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Student, {
            partial: true,
            exclude: ['id'],
          })
        },
      },
    }) student: Student
  ): Promise<void> {
    // Check duplicate `phone` property
    if (student.phone) {
      const existedStudent = await this.studentRepository.findOne({
        where: {phone: student.phone},
      })

      if (existedStudent !== null && existedStudent.id !== id) {
        throw new HttpErrors.Conflict('Duplicate `phone` property.');
      }
    }

    await this.studentRepository.updateById(id, student);
  }

  @del('/students/{id}')
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    const isExisted = await this.studentRepository.exists(id)
    if (!isExisted) {
      throw new HttpErrors.NotFound(`There is no student that \`id\` is equal to \`${id}\``)
    }

    // only executable on PostgreSQL.
    // returns object: { affectedRows: number, count: number, rows: [] }.
    await this.accountRepository.execute(
      "update account set studentid = null where studentid = $1",
      [id],
    )
    await this.studentRepository.deleteById(id);
  }
}
