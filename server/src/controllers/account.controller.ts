import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {get, getModelSchemaRef, HttpErrors, param, post, requestBody, SchemaRef} from '@loopback/rest';
import {genSalt, hash} from 'bcryptjs';
import {AccountServiceBindings} from '../keys';
import {Account, RoleMapping} from '../models';
import {AccountRepository, RoleMappingRepository, RoleRepository, StudentRepository} from '../repositories';
import {AccountService, Credentials, JWTService} from '../services';


interface SignUpCredentials {
  username: string,
  password: string,
  studentId?: string,
  roleIds?: number[], // array of role's id
}


export class AccountController {
  constructor(
    @repository(AccountRepository) public accountRepository: AccountRepository,
    @repository(StudentRepository) public studentRepository: StudentRepository,
    @repository(RoleRepository) public roleRepository: RoleRepository,
    @repository(RoleMappingRepository) public roleMappingRepository: RoleMappingRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: JWTService,
    @inject(AccountServiceBindings.ACCOUNT_SERVICE) public accountService: AccountService,
  ) {}

  // TODO: omit `password` field from Account instance.
  // TODO: add `roleIds` field to Account returned.
  @post('/accounts')
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              username: {type: 'string'},
              password: {type: 'string'},
              studentId: {type: 'string'},
              roleIds: {
                type: 'array',
                items: {type: 'number'},
              },
            },
            required: ['username', 'password']
          }
        },
      },
    })
    signUpCredentials: SignUpCredentials
  ): Promise<Account> {
    // Check existence of student by `studentId`.
    const {studentId, username, password, roleIds} = signUpCredentials
    let account = new Account({username});

    if (studentId) {
      const isExistedStudent = await this.studentRepository.exists(studentId);
      if (!isExistedStudent) {
        throw new HttpErrors.NotFound("Student not found.");
      }

      // Check whether this student has already account or not.
      const hasAlreadyAccount = await this.accountRepository.findOne({where: {studentId}})
      if (hasAlreadyAccount) {
        throw new HttpErrors.Conflict("This student has already account.")
      }

      account.studentId = studentId;
    }

    // Check existence of array of role's id.
    if (roleIds && roleIds.length > 0) {
      for (let roleId of roleIds) {
        const isExistedRole = await this.roleRepository.exists(roleId);
        if (!isExistedRole) {
          throw new HttpErrors.NotFound(`Role id ${roleId} not found.`);
        }
      }
    }

    // Validate username and password
    this.accountService.validateCredentials({username, password});

    // hash password
    account.password = await hash(password, await genSalt());

    try {
      // Insert new account to the database.
      const createdAccount = await this.accountRepository.create(account);

      // Create an array of RoleMapping and insert them to the database.
      if (roleIds && roleIds.length > 0) {
        const roleMappings = roleIds.map(roleId => {
          return new RoleMapping({roleId, accountId: createdAccount.id})
        })
        await this.roleMappingRepository.createAll(roleMappings);
      }

      return createdAccount;
    } catch (error) {
      throw error;
    }
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

    console.log(userProfile);

    return {token};
  }

  @get('/accounts')
  async find(
    @param.filter(Account) filter?: Filter<Account>
  ): Promise<Account[]> {
    return this.accountRepository.find(filter);
  }
}
