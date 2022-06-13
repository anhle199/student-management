import {Entity, model, property} from '@loopback/repository';

@model()
export class Enrollment extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id?: number;

  @property({
    type: 'number',
    default: 0,
  })
  gpa?: number;

  @property({
    type: 'number',
  })
  courseId?: number;

  @property({
    type: 'string',
  })
  studentId?: string;

  constructor(data?: Partial<Enrollment>) {
    super(data);
  }
}

export interface EnrollmentRelations {
  // defines navigational properties
}

export type EnrollmentWithRelations = Enrollment & EnrollmentRelations;
