import {Entity, model, property, belongsTo} from '@loopback/repository';
import {Student} from './student.model';

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

  constructor(data?: Partial<Account>) {
    super(data);
  }
}

export interface AccountRelations {
  // defines navigational properties here
}

export type AccountWithRelations = Account & AccountRelations;
