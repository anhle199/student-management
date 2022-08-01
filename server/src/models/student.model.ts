import {belongsTo, Entity, hasMany, hasOne, model, property} from '@loopback/repository';
import {Account} from './account.model';
import {Course} from './course.model';
import {Enrollment} from './enrollment.model';
import {UniversityClass} from './university-class.model';

export enum GenderEnum { MALE = 1, FEMALE = 2 }

@model()
export class Student extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'string',
    required: true,
    index: {unique: true},
  })
  code: string; // student ID or student code.

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'number',
    required: true,
    jsonSchema: { enum: Object.values(GenderEnum) },
  })
  gender: GenderEnum;

  @property({
    type: 'string',
    index: {unique: true},
  })
  phone?: string;

  @property({
    type: 'boolean',
    required: false,
    default: false,
  })
  isMonitor?: boolean;

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
  universityClass?: UniversityClass;
}

export type StudentWithRelations = Student & StudentRelations;
