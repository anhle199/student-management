import {model, property} from '@loopback/repository'

@model()
export class SignInCredentials {
  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  constructor(data: SignInCredentials) {
    this.username = data.username;
    this.password = data.password;
  }
}
