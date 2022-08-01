import {Entity, hasMany, model, property} from '@loopback/repository';
import {Student} from './student.model';

@model()
export class UniversityClass extends Entity {
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

  @hasMany(() => Student)
  students: Student[];

  constructor(data?: Partial<UniversityClass>) {
    super(data);
  }
}

export interface UniversityClassRelations {
  // defines navigational properties
}

export type UniversityClassWithRelations = UniversityClass & UniversityClassRelations;
