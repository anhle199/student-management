import {model, property} from '@loopback/repository'
import {SignInCredentials} from './sign-in.credentials';

@model()
export class SignUpCredentials extends SignInCredentials {
  @property({type: 'string'})
  studentId?: string;

  @property.array(Number)
  roleIds?: number[]; // array of role's id

  constructor(data: SignUpCredentials) {
    const {username, password} = data;
    super({username, password})

    this.studentId = data.studentId;
    this.roleIds = data.roleIds;
  }
}
