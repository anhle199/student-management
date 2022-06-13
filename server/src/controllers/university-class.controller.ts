import {Count, CountSchema, Filter, FilterExcludingWhere, repository, Where} from '@loopback/repository';
import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody, response} from '@loopback/rest';
import {UniversityClass} from '../models/university-class.model';
import {UniversityClassRepository} from '../repositories';

export class UniversityClassController {
  constructor(
    @repository(UniversityClassRepository)
    public universityClassRepository: UniversityClassRepository
  ) {}

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

  @get('/classes/count')
  @response(200, {
    description: 'Returns number of existing classes.',
    content: {
      'application/json': {schema: CountSchema}
    },
  })
  async count(
    @param.where(UniversityClass) where?: Where<UniversityClass>
  ): Promise<Count> {
    return this.universityClassRepository.count(where);
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

  // TODO: Check foreign key `universityClassId` when updating this property.
  @patch('/classes/{id}')
  @response(204, {
    description: 'Updates an existing UniversityClass with property/name pairs.',
  })
  async updateById(
    @param.path.number('id') id: number,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(UniversityClass, {partial: true})
        },
      },
    }) universityClass: UniversityClass,
  ): Promise<void> {
    if ('name' in universityClass) {
      const itemWithClassName = await this.universityClassRepository.findOne({where: {name: universityClass.name}});

      // The given class name has already existed.
      if (itemWithClassName !== null && itemWithClassName?.id !== id) {
        if (itemWithClassName?.id !== id) {
          throw new HttpErrors.Conflict("This class name has already existed");
        }
      }

      delete universityClass?.id;

      await this.universityClassRepository.updateById(id, universityClass);
    }
  }


  @del('/classes/{id}')
  @response(204, {
    description: 'Delete a class by the given class id.'
  })
  async deleteById(@param.path.number('id') id: number): Promise<void> {
    await this.universityClassRepository.deleteById(id);
  }
}
