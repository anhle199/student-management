import {UserService} from '@loopback/authentication';
import {Account} from '../models';
import {UserProfile, securityId} from '@loopback/security';
import {repository} from '@loopback/repository';
import {AccountRepository} from '../repositories';
import {compareSync} from 'bcryptjs'
import {HttpErrors} from '@loopback/rest';

export type Credentials = {
  username: string;
  password: string;
}

export class AccountService implements UserService<Account, Credentials> {
  constructor(
    @repository(AccountRepository) protected accountRepository: AccountRepository
  ) {}

  public validateCredentials(credentials: Credentials) {
    // validate username and password
  }

  async verifyCredentials(credentials: Credentials): Promise<Account> {
    this.validateCredentials(credentials);

    const invalidCredentialsErrorMessage = "Invalid username or password.";

    const foundAccount = await this.accountRepository.findOne({
      where: {username: credentials.username},
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
      // role: account.role,
    };
  }
}
