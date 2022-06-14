import {UserService} from '@loopback/authentication';
import {Account, SignInCredentials} from '../models';
import {UserProfile, securityId} from '@loopback/security';
import {repository} from '@loopback/repository';
import {AccountRepository} from '../repositories';
import {compareSync} from 'bcryptjs'
import {HttpErrors} from '@loopback/rest';

export class AccountService implements UserService<Account, SignInCredentials> {
  constructor(
    @repository(AccountRepository) protected accountRepository: AccountRepository
  ) {}

  public validateCredentials(credentials: SignInCredentials) {
    // validate username and password
  }

  async verifyCredentials(credentials: SignInCredentials): Promise<Account> {
    this.validateCredentials(credentials);

    const invalidCredentialsErrorMessage = "Invalid username or password.";

    const foundAccount = await this.accountRepository.findOne({
      where: {username: credentials.username},
      include: ['roles'],
    });
    if (foundAccount === null || !compareSync(credentials.password, foundAccount.password)) {
      throw new HttpErrors.Unauthorized(invalidCredentialsErrorMessage);
    }

    return foundAccount;
  }

  convertToUserProfile(account: Account): UserProfile {
    const accountId = account.id !== undefined ? account.id!.toString() : "";
    return {
      [securityId]: accountId,
      id: accountId,
      username: account.username,
      roles: account.roles,
    };
  }
}
