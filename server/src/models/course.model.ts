import {Entity, model, property, hasMany} from '@loopback/repository';
import {Student, Enrollment} from './';

@model()
export class Course extends Entity {
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
  name: string;

  @property({
    type: 'number',
    required: true,
  })
  credit: number;

  @hasMany(() => Student, {through: {model: () => Enrollment}})
  students: Student[];

  constructor(data?: Partial<Course>) {
    super(data);
  }
}

export interface CourseRelations {
  // defines navigational properties
}

export type CourseWithRelations = Course & CourseRelations;
