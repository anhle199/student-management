import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import { Filter, FilterExcludingWhere, repository } from '@loopback/repository';
import {
  del,
  get,
  getModelSchemaRef,
  HttpErrors,
  param,
  put,
  post,
  requestBody,
  RestBindings,
  Response,
} from '@loopback/rest';
import { AuthenticationStrategyConstants } from '../keys';
import { RoleEnum } from '../models';
import { UniversityClass } from '../models/university-class.model';
import { UniversityClassRepository } from '../repositories';
import { responseHandler, responseMessage } from '../utilities';

@authenticate(AuthenticationStrategyConstants.JWT)
@authorize({ allowedRoles: [RoleEnum.ADMIN] })
export class UniversityClassController {
  constructor(
    @repository(UniversityClassRepository)
    protected universityClassRepository: UniversityClassRepository,
    @inject(RestBindings.Http.RESPONSE)
    protected response: Response,
  ) {}

  @post('/classes')
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UniversityClass, {
            title: 'NewUniversityClass',
            exclude: ['id'],
          }),
        },
      },
    })
    universityClass: Omit<UniversityClass, 'id'>,
  ): Promise<Response> {
    // Find by class name ('name' property).
    // Returns an UniversityClass object if the given class name has already existed;
    // otherwise returns null
    const foundClass = await this.universityClassRepository.findOne({
      where: { name: universityClass.name },
    });

    if (foundClass !== null) {
      throw new HttpErrors.Conflict(responseMessage.ERROR.CONFLICT);
    }

    const createdUniversityClass = await this.universityClassRepository.create(universityClass);
    return responseHandler.handleSuccess(this.response, createdUniversityClass);
  }

  @get('/classes')
  async find(@param.filter(UniversityClass) filter?: Filter<UniversityClass>): Promise<UniversityClass[]> {
    return this.universityClassRepository.find(filter);
  }

  // TODO: teacher must teach the class with the given universityClassId.
  @authorize({ allowedRoles: [RoleEnum.ADMIN, RoleEnum.TEACHER] })
  @get('/classes/{id}')
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UniversityClass, { exclude: 'where' }) filter?: FilterExcludingWhere<UniversityClass>,
  ): Promise<UniversityClass> {
    const isExisted = await this.universityClassRepository.exists(id);
    if (!isExisted) {
      throw new HttpErrors.NotFound('University class not found.');
    }

    return this.universityClassRepository.findById(id, filter);
  }

  // TODO: teacher must teach the class with the given universityClassId.
  @authorize({ allowedRoles: [RoleEnum.ADMIN, RoleEnum.TEACHER] })
  @put('/classes/{id}')
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UniversityClass, {
            partial: true,
            exclude: ['id'],
          }),
        },
      },
    })
    universityClass: Omit<UniversityClass, 'id'>,
  ): Promise<void> {
    if (!universityClass.name) {
      // find a class by `name`
      const foundClass = await this.universityClassRepository.findOne({
        where: { name: universityClass.name }
      });

      // The given class name has already existed.
      if (foundClass !== null && foundClass.id !== id) {
        throw new HttpErrors.Conflict('This class name has already existed');
      }

      await this.universityClassRepository.updateById(id, universityClass);
    }
  }

  @del('/classes/{id}')
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const isExistedClass = await this.universityClassRepository.exists(id);
    if (!isExistedClass) {
      throw new HttpErrors.NotFound('University class not found.');
    }

    // only executable on PostgreSQL.
    // returns object: { affectedRows: number, count: number, rows: [] }.
    await this.universityClassRepository.execute(
      'update student set universityclassid = null where universityclassid = $1;',
      [id],
    );

    await this.universityClassRepository.deleteById(id);
  }
}
