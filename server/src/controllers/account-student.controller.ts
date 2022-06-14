import {model, property, repository} from '@loopback/repository';
import {StudentRepository, AccountRepository} from '../repositories';
import {patch, param, requestBody, HttpErrors, getModelSchemaRef} from '@loopback/rest';
import {Account, RoleEnum} from '../models';
import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {AuthenticationStrategyConstants} from '../keys';

@model()
class AssignedStudentRequest {
  @property({type: 'string', required: true})
  studentId: string
}

@authenticate(AuthenticationStrategyConstants.JWT)
@authorize({allowedRoles: [RoleEnum.ADMIN]})
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
          schema: getModelSchemaRef(AssignedStudentRequest)
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

    await this.accountRepository.updateById(accountId, {studentId: studentInfo.studentId})
  }
}
