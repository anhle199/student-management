import {authenticate} from '@loopback/authentication';
import {TokenServiceBindings} from '@loopback/authentication-jwt';
import {authorize} from '@loopback/authorization';
import {Getter, inject} from '@loopback/core';
import {Filter, model, property, repository} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';
import {AccountServiceBindings, AuthenticationStrategyConstants, PasswordHasherServiceBindings} from '../keys';
import {Account, RoleEnum, RoleMapping, SignInCredentials, SignUpCredentials} from '../models';
import {AccountRepository, RoleMappingRepository, RoleRepository, StudentRepository} from '../repositories';
import {AccountService, JWTService, PasswordHasher} from '../services';


@model()
class ChangePasswordRequest {
  @property({
    type: 'string',
    required: true,
  })
  currentPassword: string;

  @property({
    type: 'string',
    required: true,
  })
  newPassword: string;

  constructor(data: ChangePasswordRequest) {
    this.currentPassword = data.currentPassword;
    this.newPassword = data.newPassword;
  }
}


@authenticate(AuthenticationStrategyConstants.JWT)
@authorize({allowedRoles: [RoleEnum.ADMIN]})
export class AccountController {
  constructor(
    @repository(AccountRepository) protected accountRepository: AccountRepository,
    @repository(StudentRepository) protected studentRepository: StudentRepository,
    @repository(RoleRepository) protected roleRepository: RoleRepository,
    @repository(RoleMappingRepository) protected roleMappingRepository: RoleMappingRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE) protected jwtService: JWTService,
    @inject(AccountServiceBindings.ACCOUNT_SERVICE) protected accountService: AccountService,
    @inject(PasswordHasherServiceBindings.PASSWORD_HASHER) protected passwordHasher: PasswordHasher,
    @inject.getter(SecurityBindings.USER) private getCurrentUser: Getter<UserProfile>,
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
    account.password = await this.passwordHasher.hash(password);

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

  @authorize.skip()
  @patch('/accounts/{id}/change-password')
  async changePassword(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChangePasswordRequest)
        }
      }
    }) requestInstance: ChangePasswordRequest,
  ): Promise<void> {
    // Compare token's userId and request's userId.
    const currentUser = await this.getCurrentUser();
    if (currentUser.id !== id) {
      throw new HttpErrors.Forbidden("Not allowed to access this api.");
    }

    const foundAccount = await this.accountRepository.findById(id);
    const {currentPassword, newPassword} = requestInstance;

    // Verify current passed password with stored password.
    // Validate new password.
    const isMatchedCurrentPassword = await this.passwordHasher.verify(currentPassword, foundAccount.password);
    if (!isMatchedCurrentPassword || !this.accountService.validatePassword(newPassword)) {
      throw new HttpErrors.BadRequest("Incorrect current password or invalid new password.");
    }

    // Hash new password and save to database.
    const newHashedPassword = await this.passwordHasher.hash(newPassword);
    await this.accountRepository.updateById(id, {password: newHashedPassword});
  }

  @del('/accounts/{id}')
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const isExistedAccount = await this.accountRepository.exists(id);
    if (!isExistedAccount) {
      throw new HttpErrors.NotFound("Account not found.");
    }

    // remove referenced row from `account` to `role_mapping`.
    await this.roleMappingRepository.deleteAll({accountId: id});

    // remove account by id.
    await this.accountRepository.deleteById(id);
  }
}
