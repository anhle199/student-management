import {Entity, model, property} from '@loopback/repository';
import {TimestampMixin} from '../mixins';

@model()
export class Migration extends TimestampMixin(Entity) {
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
  name: string;

  constructor(data?: Partial<Migration>) {
    super(data);
  }
}

export interface MigrationRelations {
  // defines navigational properties
}

export type MigrationWithRelations = Migration & MigrationRelations;
