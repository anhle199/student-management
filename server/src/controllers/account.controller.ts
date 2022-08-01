import { authenticate } from '@loopback/authentication';
import { TokenServiceBindings } from '@loopback/authentication-jwt';
import { authorize } from '@loopback/authorization';
import { Getter, inject } from '@loopback/core';
import { Filter, model, property, repository } from '@loopback/repository';
import { del, get, getModelSchemaRef, HttpErrors, param, put, post, requestBody } from '@loopback/rest';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { AccountServiceBindings, AuthenticationStrategyConstants } from '../keys';
import { Account, RoleEnum, RoleMapping, SignInCredentials, SignUpCredentials } from '../models';
import { AccountRepository, RoleMappingRepository, RoleRepository, StudentRepository } from '../repositories';
import { AccountService, JWTService, verifyMatchingUserIdVoter } from '../services';
import { encrypt, verifyPassword } from '../utilities/encrypt';

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
@authorize({ allowedRoles: [RoleEnum.ADMIN] })
export class AccountController {
  constructor(
    @repository(AccountRepository)
    protected accountRepository: AccountRepository,
    @repository(StudentRepository)
    protected studentRepository: StudentRepository,
    @repository(RoleRepository) protected roleRepository: RoleRepository,
    @repository(RoleMappingRepository)
    protected roleMappingRepository: RoleMappingRepository,
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    protected jwtService: JWTService,
    @inject(AccountServiceBindings.ACCOUNT_SERVICE)
    protected accountService: AccountService,
  ) {}

  @post('/accounts')
  async signUp(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(SignUpCredentials),
        },
      },
    })
    signUpCredentials: SignUpCredentials,
  ): Promise<Account> {
    const { username, password, roleIds } = signUpCredentials;
    const account = new Account({ username });

    // Check existence of array of role's id.
    if (roleIds && roleIds.length > 0) {
      for (const roleId of roleIds) {
        const isExistedRole = await this.roleRepository.exists(roleId);
        if (!isExistedRole) {
          throw new HttpErrors[404]('Role not found');
        }
      }
    }

    // Validate username and password
    this.accountService.validateCredentials({ username, password });

    try {
      // hash password
      account.password = await encrypt(password);
    } catch (error) {
      throw new HttpErrors[422]('Failed to sign up');
    }

    // Insert new account to the database.
    const createdAccount = await this.accountRepository.create(account);

    // Create an array of RoleMapping and insert them to the database.
    if (roleIds && roleIds.length > 0) {
      const roleMappings = roleIds.map(roleId => {
        return new RoleMapping({ roleId, accountId: createdAccount.id });
      });
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
          schema: getModelSchemaRef(SignInCredentials),
        },
      },
    })
    credentials: SignInCredentials,
  ): Promise<{ token: string }> {
    const account = await this.accountService.verifyCredentials(credentials);
    const userProfile = this.accountService.convertToUserProfile(account);
    const token = await this.jwtService.generateToken(userProfile);

    return { token };
  }

  @get('/accounts')
  async find(@param.filter(Account) filter?: Filter<Account>): Promise<Account[]> {
    return this.accountRepository.find(filter);
  }

  @authorize({ voters: [verifyMatchingUserIdVoter] })
  @put('/accounts/{id}/change-password')
  async changePassword(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(ChangePasswordRequest),
        },
      },
    })
    requestInstance: ChangePasswordRequest,
  ): Promise<void> {
    const foundAccount = await this.accountRepository.findById(id);
    const { currentPassword, newPassword } = requestInstance;

    // Verify current passed password with stored password.
    // Validate new password.
    const isMatchedCurrentPassword = await verifyPassword(currentPassword, foundAccount.password);
    if (!isMatchedCurrentPassword || !this.accountService.validatePassword(newPassword)) {
      throw new HttpErrors.BadRequest('Incorrect current password or invalid new password.');
    }

    try {
      // Hash new password and save to database.
      const newHashedPassword = await encrypt(newPassword);
      await this.accountRepository.updateById(id, { password: newHashedPassword });
    } catch (error) {
      throw new HttpErrors[422]('Failed to sign up');
    }
  }

  @del('/accounts/{id}')
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const isExistedAccount = await this.accountRepository.exists(id);
    if (!isExistedAccount) {
      throw new HttpErrors.NotFound('Account not found.');
    }

    // remove referenced row from `account` to `role_mapping`.
    await this.roleMappingRepository.execute('delete from rolemapping where accountid = $1;', [id]);

    // remove account by id.
    await this.accountRepository.deleteById(id);
  }
}
