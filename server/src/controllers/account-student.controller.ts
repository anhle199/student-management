import {repository} from '@loopback/repository';
import {StudentRepository, AccountRepository} from '../repositories';
import {patch, param, requestBody, HttpErrors} from '@loopback/rest';
import {Account} from '../models';

interface AssignedStudentRequest {
  studentId: string
}

export class AccountStudentController {
  constructor(
    @repository('StudentRepository') protected studentRepository: StudentRepository,
    @repository('AccountRepository') protected accountRepository: AccountRepository,
  ) {}

  @patch('accounts/{id}/assign-student')
  async assignStudent(
    @param.path.number('id') accountId: typeof Account.prototype.id,
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              studentId: {type: 'string'},
            },
            required: ['studentId'],
          },
        },
      },
    })
    studentInfo: AssignedStudentRequest
  ): Promise<void> {
    const isExistedAccount = await this.accountRepository.exists(accountId);
    const isExistedStudent = await this.studentRepository.exists(studentInfo.studentId);

    if (!isExistedAccount || !isExistedStudent) {
      throw new HttpErrors.NotFound('Account or student does not exist.')
    }

    this.accountRepository.updateById(accountId, {studentId: studentInfo.studentId})
  }
}
