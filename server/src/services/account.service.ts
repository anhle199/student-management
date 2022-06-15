import {UserService} from '@loopback/authentication';
import {Account, SignInCredentials} from '../models';
import {UserProfile, securityId} from '@loopback/security';
import {repository} from '@loopback/repository';
import {AccountRepository} from '../repositories';
import {HttpErrors} from '@loopback/rest';
import {PasswordHasherServiceBindings} from '../keys';
import {PasswordHasher} from './bcrypt-hasher.service';
import {inject} from '@loopback/core';

export class AccountService implements UserService<Account, SignInCredentials> {
  constructor(
    @repository(AccountRepository) protected accountRepository: AccountRepository,
    @inject(PasswordHasherServiceBindings.PASSWORD_HASHER) protected passwordHasher: PasswordHasher
  ) {}

  public validatePassword(password: string): boolean {
    return password.length >= 8;
  }

  public validateCredentials(credentials: SignInCredentials) {
    const invalidCredentialsErrorMessage = "Invalid username or password.";

    // validate username and password
    if (!this.validatePassword(credentials.password)) {
      throw new HttpErrors.BadRequest(invalidCredentialsErrorMessage)
    }
  }

  async verifyCredentials(credentials: SignInCredentials): Promise<Account> {
    this.validateCredentials(credentials);

    const incorrectCredentialsErrorMessage = "Incorrect username or password.";

    const foundAccount = await this.accountRepository.findOne({
      where: {username: credentials.username},
      include: ['roles'],
    });

    if (foundAccount === null) {
      throw new HttpErrors.Unauthorized(incorrectCredentialsErrorMessage);
    }

    const isMatchPassword = await this.passwordHasher.verify(credentials.password, foundAccount.password);
    if (!isMatchPassword) {
      throw new HttpErrors.Unauthorized(incorrectCredentialsErrorMessage);
    }

    return foundAccount;
  }

  convertToUserProfile(account: Account): UserProfile {
    // account always has `id` property.
    return {
      [securityId]: account.id!.toString(),
      id: account.id!,
      username: account.username,
      roles: account.roles,
    };
  }
}
