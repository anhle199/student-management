import {repository, Count, Filter} from '@loopback/repository';
import {param, patch, HttpErrors, get, getModelSchemaRef, requestBody, getJsonSchemaRef, getFieldsJsonSchemaFor, getJsonSchema, del} from '@loopback/rest';
import {UniversityClassRepository, StudentRepository} from '../repositories';
import {Student} from '../models/student.model';

export class ClassStudentController {
  constructor(
    @repository("UniversityClassRepository")
    protected universityClassRepository: UniversityClassRepository,
    @repository("StudentRepository")
    protected studentRepository: StudentRepository,
  ) {}


  @get('/classes/{universityClassId}/students')
  async getAllStudents(
    @param.path.number('universityClassId') universityClassId: number,
    @param.filter(Student) filter?: Filter<Omit<Student, 'universityClassId'>>,
  ): Promise<Student[]> {
    const isExistedClass = await this.universityClassRepository.exists(universityClassId)
    if (!isExistedClass) {
      throw new HttpErrors.NotFound(`There is no class that \`id\` is equal to \`${universityClassId}\``)
    }

    return this.universityClassRepository.students(universityClassId).find(filter)
  }

}
