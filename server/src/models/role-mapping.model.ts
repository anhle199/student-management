import {Entity, model, property} from '@loopback/repository';

@model()
export class RoleMapping extends Entity {
  @property({
    type: 'number',
    id: true,
    generated: true,
  })
  id: number;

  @property({type: 'number'})
  accountId?: number;

  @property({type: 'number'})
  roleId?: number;

  constructor(data?: Partial<RoleMapping>) {
    super(data);
  }
}

export interface RoleMappingRelations {
  // defines navigational properties
}

export type RoleMappingWithRelations = RoleMapping & RoleMappingRelations;
