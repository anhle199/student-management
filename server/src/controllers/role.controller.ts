import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { Filter, repository } from '@loopback/repository';
import { del, get, getModelSchemaRef, param, put, post, requestBody, HttpErrors } from '@loopback/rest';
import { AuthenticationStrategyConstants } from '../keys';
import { Role, RoleEnum } from '../models';
import { RoleMappingRepository, RoleRepository } from '../repositories';

@authenticate(AuthenticationStrategyConstants.JWT)
@authorize({ allowedRoles: [RoleEnum.ADMIN] })
export class RoleController {
  constructor(
    @repository(RoleRepository) protected roleRepository: RoleRepository,
    @repository(RoleMappingRepository) protected roleMappingRepository: RoleMappingRepository,
  ) {}

  @post('/roles')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Role, {
            title: 'NewRole',
            exclude: ['id'],
          }),
        },
      },
    })
    role: Omit<Role, 'id'>,
  ): Promise<Role> {
    return this.roleRepository.create(role);
  }

  @get('/roles')
  async getAll(@param.filter(Role) filter?: Filter<Role>): Promise<Role[]> {
    return this.roleRepository.find(filter);
  }

  @put('/roles/{id}')
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Role, {
            exclude: ['id'],
          }),
        },
      },
    })
    role: Role,
  ): Promise<void> {
    await this.roleRepository.updateById(id, role);
  }

  @del('/roles/{id}')
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const isExistedRole = await this.roleRepository.exists(id);
    if (!isExistedRole) {
      throw new HttpErrors[404]('Role not found');
    }

    await this.roleMappingRepository.execute('delete from rolemapping where roleid = $1;', [id]);
    await this.roleRepository.deleteById(id);
  }
}
