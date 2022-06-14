import {authenticate} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {authorize} from '@loopback/authorization';
import {inject} from '@loopback/core';
import {Filter, repository} from '@loopback/repository';
import {get, getModelSchemaRef, HttpErrors, param, post, requestBody} from '@loopback/rest';
import {genSalt, hash} from 'bcryptjs';
import {AccountServiceBindings, AuthenticationStrategyConstants} from '../keys';
import {Account, RoleEnum, RoleMapping, SignInCredentials, SignUpCredentials} from '../models';
import {AccountRepository, RoleMappingRepository, RoleRepository, StudentRepository} from '../repositories';
import {AccountService, JWTService} from '../services';


@authenticate(AuthenticationStrategyConstants.JWT)
@authorize({allowedRoles: [RoleEnum.ADMIN]})
export class AccountController {
  constructor(
    @repository(AccountRepository) public accountRepository: AccountRepository,
    @repository(StudentRepository) public studentRepository: StudentRepository,
    @repository(RoleRepository) public roleRepository: RoleRepository,
    @repository(RoleMappingRepository) public roleMappingRepository: RoleMappingRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE) public jwtService: JWTService,
    @inject(AccountServiceBindings.ACCOUNT_SERVICE) public accountService: AccountService,
  ) { }

  // TODO: add `roleIds` field to Account returned.
  @post('/accounts')
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SignUpCredentials)
        },
      },
    })
    signUpCredentials: SignUpCredentials
  ): Promise<Account> {
    const {studentId, username, password, roleIds} = signUpCredentials
    const account = new Account({username, studentId});

    if (studentId) {
      const isExistedStudent = await this.studentRepository.exists(studentId);
      if (!isExistedStudent) {
        throw new HttpErrors.NotFound("Student not found.");
      }

      // Check whether this student has already account or not.
      const hasAlreadyAccount = await this.accountRepository.findOne({where: {studentId}})
      if (hasAlreadyAccount) {
        throw new HttpErrors.Conflict("This student has already an account.")
      }
    }

    // Check existence of array of role's id.
    if (roleIds && roleIds.length > 0) {
      for (const roleId of roleIds) {
        const isExistedRole = await this.roleRepository.exists(roleId);
        if (!isExistedRole) {
          throw new HttpErrors.NotFound(`Role not found.`);
        }
      }
    }

    // Validate username and password
    this.accountService.validateCredentials({username, password});

    // hash password
    account.password = await hash(password, await genSalt());

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
  }

  @authenticate.skip()
  @authorize.skip()
  @post('/accounts/login')
  async login(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SignInCredentials)
        },
      },
    })
    credentials: SignInCredentials
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
