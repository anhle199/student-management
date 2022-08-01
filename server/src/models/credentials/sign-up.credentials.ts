import {model, property} from '@loopback/repository'
import {SignInCredentials} from './sign-in.credentials';

@model()
export class SignUpCredentials extends SignInCredentials {
  @property.array(Number)
  roleIds?: number[]; // array of role's id

  constructor(data: SignUpCredentials) {
    const {username, password} = data;
    super({username, password});

    this.roleIds = data.roleIds;
  }
}
