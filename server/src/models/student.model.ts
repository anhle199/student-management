import {belongsTo, Entity, hasMany, hasOne, model, property} from '@loopback/repository';
import {Account} from './account.model';
import {Course} from './course.model';
import {Enrollment} from './enrollment.model';
import {UniversityClass} from './university-class.model';

enum Gender {
  MALE = 1, FEMALE = 2
}

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
    type: 'number',
    required: true,
    jsonSchema: { enum: Object.values(Gender) },
  })
  gender: Gender;

  @property({
    type: 'string',
    index: {unique: true},
  })
  phone?: string;

  @belongsTo(() => UniversityClass)
  universityClassId: number;

  @hasOne(() => Account)
  account: Account;

  @hasMany(() => Course, {through: {model: () => Enrollment}})
  courses: Course[];

  constructor(data?: Partial<Student>) {
    super(data);
  }
}

export interface StudentRelations {
  // defines navigational properties
}

export type StudentWithRelations = Student & StudentRelations;
