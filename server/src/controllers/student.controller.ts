import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { Count, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { del, get, getModelSchemaRef, HttpErrors, param, put, post, requestBody } from '@loopback/rest';
import { AuthenticationStrategyConstants } from '../keys';
import { Course, RoleEnum, Student } from '../models';
import { AccountRepository, RoleMappingRepository, RoleRepository, StudentRepository } from '../repositories';
import { encrypt } from '../utilities/encrypt';

const topLevelRoles = [RoleEnum.ADMIN];

@authenticate(AuthenticationStrategyConstants.JWT)
@authorize({ allowedRoles: topLevelRoles })
export class StudentController {
  constructor(
    @repository(AccountRepository) protected accountRepository: AccountRepository,
    @repository(StudentRepository) protected studentRepository: StudentRepository,
    @repository(RoleRepository) protected roleRepository: RoleRepository,
    @repository(RoleMappingRepository) protected roleMappingRepository: RoleMappingRepository,
  ) {}

  @post('/students')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Student, {
            title: 'NewStudent',
            optional: ['universityClassId'],
          }),
        },
      },
    })
    student: Student,
  ): Promise<Student> {
    // Conflict condition: students who have the same `id` or `phone` with these given values.

    // Create where condition statement to find students that satisfy the above condition.
    const whereStatement = { where: {} };
    if (student.phone) {
      whereStatement.where = {
        or: [{ code: student.code }, { phone: student.phone }],
      };
    } else {
      whereStatement.where = { code: student.code };
    }

    // Find students that satisfy the above condition.
    const foundStudents = await this.studentRepository.find(whereStatement);
    if (foundStudents.length !== 0) {
      throw new HttpErrors[409]('Duplicate property `code` or `phone`');
    }

    // create student
    const insertedStudent = await this.studentRepository.create(student);

    // get student member role
    const studentMemberRole = await this.roleRepository.findOne({ where: { name: RoleEnum.STUDENT_MEMBER } });

    // create account
    if (studentMemberRole) {
      const encryptedPassword = await encrypt(student.code);
      const insertedAccount = await this.accountRepository.create({
        username: student.code,
        password: encryptedPassword,
        studentId: insertedStudent.id,
      });

      // insert `student_member` role for this student into the database
      await this.roleMappingRepository.create({
        roleId: studentMemberRole.id,
        accountId: insertedAccount.id,
      });
    } // else {
    //   await this.studentRepository.deleteById(insertedStudent.id);
    //   return Promise.reject();
    // }

    return insertedStudent;
  }

  @authorize({
    allowedRoles: [...topLevelRoles, RoleEnum.TEACHER, RoleEnum.STUDENT_MONITOR],
  })
  @get('/students')
  async find(@param.filter(Student) filter?: Filter<Student>): Promise<Student[]> {
    return this.studentRepository.find(filter);
  }

  @authorize({
    allowedRoles: [...topLevelRoles, RoleEnum.TEACHER, RoleEnum.STUDENT_MONITOR, RoleEnum.STUDENT_MEMBER],
  })
  @get('/students/{id}')
  async findById(
    @param.path.number('id') id: number,
    @param.filter(Student, { exclude: 'where' }) filter?: FilterExcludingWhere<Student>,
  ): Promise<Student> {
    return this.studentRepository.findById(id, filter);
  }

  @authorize({
    allowedRoles: [...topLevelRoles, RoleEnum.TEACHER, RoleEnum.STUDENT_MONITOR],
  })
  @get('/students/count')
  async count(@param.where(Student) where?: Where<Student>): Promise<Count> {
    return this.studentRepository.count(where);
  }

  @authorize({
    allowedRoles: [...topLevelRoles, RoleEnum.TEACHER, RoleEnum.STUDENT_MEMBER],
  })
  @put('/students/{id}')
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Student, {
            exclude: ['id'],
          }),
        },
      },
    })
    newStudent: Omit<Student, 'id'>,
  ): Promise<void> {
    // Check duplicate `code` property
    if (newStudent.code) {
      const foundStudent = await this.studentRepository.findOne({
        where: { code: newStudent.code },
      });

      if (foundStudent !== null && foundStudent.id !== id) {
        throw new HttpErrors[409]('Duplicate `code` property.');
      }
    }

    // Check duplicate `phone` property
    if (newStudent.phone) {
      const foundStudent = await this.studentRepository.findOne({
        where: { phone: newStudent.phone },
      });

      if (foundStudent !== null && foundStudent.id !== id) {
        throw new HttpErrors[409]('Duplicate `phone` property.');
      }
    }

    const student = await this.studentRepository.findById(id);

    // insert/remove `STUDENT_MONITOR` for this student.
    if (student.isMonitor !== newStudent.isMonitor) {
      const account = await this.accountRepository.findOne({
        where: { studentId: student.id },
      });
      const studentMonitorRole = await this.roleRepository.findOne({
        where: { name: RoleEnum.STUDENT_MONITOR },
      });

      if (account && studentMonitorRole) {
        if (student.isMonitor && !newStudent.isMonitor) {
          await this.roleMappingRepository.execute('delete from rolemapping where roleid = $1 and accountid = $2;', [
            studentMonitorRole.id,
            account.id,
          ]);
        } else if (!student.isMonitor && newStudent.isMonitor) {
          // insert `STUDENT_MONITOR` role
          await this.roleMappingRepository.create({ roleId: studentMonitorRole.id, accountId: account.id });
        }
      }
    }

    await this.studentRepository.updateById(id, newStudent);
  }

  @del('/students/{id}')
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const isExisted = await this.studentRepository.exists(id);
    if (!isExisted) {
      throw new HttpErrors[404]('Student not found.');
    }

    const account = await this.accountRepository.findOne({ where: { studentId: id } });
    await this.accountRepository.roles(account?.id).unlinkAll();
    await this.accountRepository.deleteById(account?.id);

    await this.studentRepository.deleteById(id);
  }

  // Fetch all courses of a specific student
  @get('/students/{id}/courses')
  async getAllCourses(
    @param.path.number('id') id: number,
    @param.filter(Course) filter?: Filter<Course>,
  ): Promise<Course[]> {
    const isExistedStudent = await this.studentRepository.exists(id);
    if (!isExistedStudent) {
      throw new HttpErrors[404]('Student not found.');
    }

    return this.studentRepository.courses(id).find(filter);
  }
}
