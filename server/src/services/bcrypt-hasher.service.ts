import {inject} from '@loopback/core'
import {PasswordHasherServiceBindings} from '../keys'
import {hash, genSalt, compare} from 'bcryptjs'

export interface PasswordHasher<T = string> {
  hash(password: T): Promise<T>
  verify(rawPassword: T, encodedPassword: T): Promise<boolean>
}

export class BcryptHasher implements PasswordHasher {
  @inject(PasswordHasherServiceBindings.ROUNDS)
  public readonly rounds: number;

  async hash(password: string): Promise<string> {
    return hash(password, await genSalt(this.rounds));
  }

  verify(rawPassword: string, encodedPassword: string): Promise<boolean> {
    return compare(rawPassword, encodedPassword);
  }
}
