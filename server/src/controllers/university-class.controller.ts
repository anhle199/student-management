import {authenticate} from '@loopback/authentication';
import {authorize} from '@loopback/authorization';
import {Filter, FilterExcludingWhere, repository} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody, response} from '@loopback/rest';
import {AuthenticationStrategyConstants} from '../keys';
import {RoleEnum} from '../models';
import {UniversityClass} from '../models/university-class.model';
import {UniversityClassRepository} from '../repositories';

@authenticate(AuthenticationStrategyConstants.JWT)
@authorize({allowedRoles: [RoleEnum.ADMIN]})
export class UniversityClassController {
  constructor(
    @repository(UniversityClassRepository)
    public universityClassRepository: UniversityClassRepository,
  ) { }

  @post('/classes')
  @response(201, {
    description: 'Adds a new class into the database.',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UniversityClass),
      },
    },
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UniversityClass, {
            title: "NewUniversityClass",
            exclude: ['id'],
          })
        },
      },
    })
    universityClass: Omit<UniversityClass, 'id'>
  ): Promise<UniversityClass> {
    console.log(universityClass)
    // Find by class name ('name' property).
    // Returns an UniversityClass object if the given class name has already existed;
    // otherwise returns null
    const foundClass = await this.universityClassRepository.findOne({
      where: {name: universityClass.name},
    });

    if (foundClass !== null) {
      throw new HttpErrors.Conflict("This class has already existed.");
    }

    return this.universityClassRepository.create(universityClass);
  }

  @get('/classes')
  @response(200, {
    description: 'Gets a list of classes (all).',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(UniversityClass, {includeRelations: true}),
        }
      }
    }
  })
  async find(
    @param.filter(UniversityClass) filter?: Filter<UniversityClass>
  ): Promise<UniversityClass[]> {
    return this.universityClassRepository.find(filter);
  }

  // TODO: teacher must teach the class with the given universityClassId.
  @authorize({allowedRoles: [RoleEnum.ADMIN, RoleEnum.TEACHER]})
  @get('/classes/{id}')
  @response(200, {
    description: 'Gets a specific class by the given class ID.',
    content: {
      'application/json': {
        schema: getModelSchemaRef(UniversityClass),
      },
    },
  })
  async findById(
    @param.path.number('id') id: number,
    @param.filter(UniversityClass, {exclude: 'where'}) filter?: FilterExcludingWhere<UniversityClass>,
  ): Promise<UniversityClass> {
    return this.universityClassRepository.findById(id, filter);
  }

  // TODO: teacher must teach the class with the given universityClassId.
  @authorize({allowedRoles: [RoleEnum.ADMIN, RoleEnum.TEACHER]})
  @patch('/classes/{id}')
  @response(204, {
    description: 'Updates an existing UniversityClass with property/name pairs.',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UniversityClass, {
            partial: true,
            exclude: ['id'],
          })
        },
      },
    }) universityClass: Omit<UniversityClass, 'id'>
  ): Promise<void> {
    if ('name' in universityClass) {
      // find a class by `name`
      const foundClass = await this.universityClassRepository.findOne({where: {name: universityClass.name}});

      // The given class name has already existed.
      if (foundClass !== null && foundClass.id !== id) {
        throw new HttpErrors.Conflict("This class name has already existed");
      }

      await this.universityClassRepository.updateById(id, universityClass);
    }
  }


  @del('/classes/{id}')
  @response(204, {
    description: 'Delete a class by the given class id.'
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    const isExistedClass = await this.universityClassRepository.exists(id)
    if (!isExistedClass) {
      throw new HttpErrors.NotFound("University class not found.");
    }

    try {
      // only executable on PostgreSQL.
      // returns object: { affectedRows: number, count: number, rows: [] }.
      await this.universityClassRepository.execute(
        "update student set universityclassid = null where universityclassid = $1",
        [id],
      )

      await this.universityClassRepository.deleteById(id);
    } catch (error) {
      console.log({endpoint: `/classes/${id}`, error})
      throw error;
    }
  }
}
