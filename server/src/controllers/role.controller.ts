import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {repository} from '@loopback/repository';
import {del, getModelSchemaRef, param, patch, post, requestBody} from '@loopback/rest';
import {AuthenticationStrategyConstants} from '../keys';
import {Role, RoleEnum} from '../models';
import {RoleRepository} from '../repositories';

@authenticate(AuthenticationStrategyConstants.JWT)
@authorize({allowedRoles: [RoleEnum.ADMIN]})
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

  @patch('/roles/{id}')
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Role, {
            exclude: ['id']
          })
        }
      }
    }) role: Role
  ): Promise<void> {
    await this.roleRepository.updateById(id, role);
  }

  @del('/roles/{id}')
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.roleRepository.deleteById(id);
  }
}
