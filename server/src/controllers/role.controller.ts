import {repository} from '@loopback/repository';
import {getModelSchemaRef, post, requestBody} from '@loopback/rest';
import {Role} from '../models';
import {RoleRepository} from '../repositories';

export class RoleController {
  constructor(@repository(RoleRepository) protected roleRepository: RoleRepository) { }

  @post('/roles')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Role, {
            title: "NewRole",
            exclude: ['id'],
          })
        }
      }
    })
    role: Omit<Role, 'id'>
  ): Promise<Role> {
    return this.roleRepository.create(role);
  }
}
