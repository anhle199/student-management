import {Entity, model, property, belongsTo, hasMany} from '@loopback/repository';
import {RoleMapping} from './role-mapping.model';
import {Role} from './role.model';
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

  @belongsTo(() => Student)
  studentId: string;

  @hasMany(() => Role, {through: {model: () => RoleMapping}})
  roles: Role[];

  constructor(data?: Partial<Account>) {
    super(data);
  }
}

export interface AccountRelations {
  // defines navigational properties here
}

export type AccountWithRelations = Account & AccountRelations;
