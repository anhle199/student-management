import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {get, getModelSchemaRef, HttpErrors, param, post, requestBody} from '@loopback/rest';
import {genSalt, hash} from 'bcryptjs';
import {AccountServiceBindings} from '../keys';
import {Account} from '../models';
import {AccountRepository, StudentRepository} from '../repositories';
import {AccountService, Credentials, JWTService} from '../services';

export class AccountController {
  constructor(
    @repository(AccountRepository) public accountRepository: AccountRepository,
    @repository(StudentRepository) public studentRepository: StudentRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: JWTService,
    @inject(AccountServiceBindings.ACCOUNT_SERVICE) public accountService: AccountService,
  ) {}

  // TODO: omit `password` field from Account instance.
  @post('/accounts')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Account, {
            title: 'NewAccount',
            exclude: ['id'],
            optional: ['studentId'],
          }),
        },
      },
    })
    account: Account
  ): Promise<Account> {
    // Check existence of student by `studentId`.
    const {studentId, username, password} = account
    if (studentId) {
      const isExistedStudent = await this.studentRepository.exists(studentId);
      if (!isExistedStudent) {
        throw new HttpErrors.NotFound("Student not found.");
      }
    }

    // Validate username and password
    this.accountService.validateCredentials({username, password});

    account.password = await hash(password, await genSalt());
    return this.accountRepository.create(account);
  }

  @post('/accounts/login')
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: {type: 'string'},
              password: {type: 'string'},
            },
            required: ['username', 'password'],
          }
        },
      },
    })
    credentials: Credentials
  ): Promise<{token: string}> {
    const account = await this.accountService.verifyCredentials(credentials);
    const userProfile = this.accountService.convertToUserProfile(account);
    const token = await this.jwtService.generateToken(userProfile);

    return {token};
  }

  @get('/accounts')
  async find(
    @param.filter(Account) filter?: Filter<Account>
  ): Promise<Account[]> {
    return this.accountRepository.find(filter);
  }
}
