import {belongsTo, Entity, model, property, hasOne} from '@loopback/repository';
import {UniversityClass} from './university-class.model';
import {Account} from './account.model';

@model()
export class Student extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    index: {unique: true},
  })
  phone?: string;

  @belongsTo(() => UniversityClass)//, {}, {jsonSchema: {nullable: true},})
  universityClassId: number;

  @hasOne(() => Account)
  account: Account;

  constructor(data?: Partial<Student>) {
    super(data);
  }
}

export interface StudentRelations {
  // defines navigational properties
}

export type StudentWithRelations = Student & StudentRelations;
