import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Student} from './student.model';

export enum UserRole {
  MEMBER = "MEMBER",
  MONITOR = "MONITOR",
}

@model()
export class Account extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
    //hidden: true,
  })
  password: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {enum: Object.values(UserRole)},
  })
  role: UserRole;

  @belongsTo(() => Student)
  studentId: string;

  constructor(data?: Partial<Account>) {
    super(data);
  }
}

export interface AccountRelations {
  // defines navigational properties here
}

export type AccountWithRelations = Account & AccountRelations;
