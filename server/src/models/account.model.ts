import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {RoleMapping} from './role-mapping.model';
import {Role} from './role.model';
import {Student} from './student.model';

export enum RoleEnum {
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT_MEMBER = "STUDENT_MEMBER",
  STUDENT_MONITOR = "STUDENT_MONITOR",
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
    hidden: true,
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
