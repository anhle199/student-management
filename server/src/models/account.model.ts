import {belongsTo, Entity, hasMany, model, property} from '@loopback/repository';
import {RoleMapping} from './role-mapping.model';
import {Role} from './role.model';
import {Student, StudentWithRelations} from './student.model';

export enum RoleEnum {
  ADMIN = "admin",
  TEACHER = "teacher",
  STUDENT_MEMBER = "student_member",
  STUDENT_MONITOR = "student_monitor",
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
  studentId: number;

  @hasMany(() => Role, {through: {model: () => RoleMapping}})
  roles: Role[];

  constructor(data?: Partial<Account>) {
    super(data);
  }
}

export interface AccountRelations {
  // defines navigational properties here
  student?: StudentWithRelations;
}

export type AccountWithRelations = Account & AccountRelations;
