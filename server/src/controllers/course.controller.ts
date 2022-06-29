import { authenticate } from "@loopback/authentication";
import {authorize} from '@loopback/authorization';
import { Count, Filter, repository } from "@loopback/repository";
import {del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody} from '@loopback/rest';
import { AuthenticationStrategyConstants } from "../keys";
import {Course, Enrollment, RoleEnum} from '../models';
import { CourseRepository, EnrollmentRepository, StudentRepository } from "../repositories";

@authenticate(AuthenticationStrategyConstants.JWT)
@authorize({allowedRoles: [RoleEnum.ADMIN]})
export class CourseController {
  constructor(
    @repository(CourseRepository) protected courseRepository: CourseRepository,
    @repository(EnrollmentRepository) protected enrollmentRepository: EnrollmentRepository,
    @repository(StudentRepository) protected studentRepository: StudentRepository,
  ) { }

  @get("/courses")
  async getAll(@param.filter(Course) filter?: Filter<Course>): Promise<Course[]> {
    return this.courseRepository.find(filter);
  }

  @post("/courses")
  async create(
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Course, {
            exclude: ["id"],
          })
        }
      }
    })
    course: Omit<Course, "id">
  ): Promise<Course> {
    const foundCourse = await this.courseRepository.findOne({
      where: {name: course.name}
    })

    if (foundCourse) {
      throw new HttpErrors.Conflict("Duplicate course name.")
    }

    return this.courseRepository.create(course);
  }

  @del("/roles/{id}")
  async deleteById(@param.path.number("id") id: number): Promise<void> {
    const isExisted = await this.courseRepository.exists(id);
    if (!isExisted) {
      throw new HttpErrors.NotFound("Class not found.");
    }

    // remove enrollments by the given course id
    await this.enrollmentRepository.deleteAll({courseId: id});

    // remove course by the given course id
    await this.courseRepository.deleteById(id);
  }

  @patch("/roles/{id}")
  async updateById(
    @param.path.number("id") id: number,
    @requestBody({
      content: {
        "application/json": {
          schema: getModelSchemaRef(Course, {
            exclude: ["id"],
          })
        }
      }
    }) course: Course,
  ): Promise<void> {
    const foundCourse = await this.courseRepository.findOne({
      where: {name: course.name}
    });

    if (foundCourse && foundCourse.id !== id) {
      throw new HttpErrors.Conflict("Duplicate course name.");
    }

    await this.courseRepository.updateById(id, course);
  }

  // Assign list of students to course
  @post("/courses/{id}/assign-students")
  async assignStudents(
    @param.path.number("id") id: number,
    @requestBody({
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    }) studentIds: string[]
  ): Promise<void> {
    // Check whether the given course id is existing or not.
    const isExistedCourse = await this.courseRepository.exists(id);
    if (!isExistedCourse) {
      throw new HttpErrors.NotFound("Course not found.")
    }

    const enrollments: Enrollment[] = []
    for (const studentId of studentIds) {
      // Check whether the student id is existing or not.
      const isExistedStudent = await this.studentRepository.exists(studentId);
      if (!isExistedStudent) {
        throw new HttpErrors.NotFound("Student not found.")
      }

      // Check whether the student has already enrolled or not.
      const foundEnrollment = await this.enrollmentRepository.findOne({
        where: {
          courseId: id,
          studentId
        }
      })

      if (!foundEnrollment) {
        enrollments.push(new Enrollment({courseId: id, studentId}))
      }
    }

    await this.enrollmentRepository.createAll(enrollments)
  }

  // Remove list of students to course
  @post("/courses/{id}/remove-students")
  async removeStudents(
    @param.path.number("id") id: number,
    @requestBody({
      content: {
        "application/json": {
          schema: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    }) studentIds: string[]
  ): Promise<void> {
    // Check whether the given course id is existing or not.
    const isExistedCourse = await this.courseRepository.exists(id);
    if (!isExistedCourse) {
      throw new HttpErrors.NotFound("Course not found.")
    }

    // Check whether all students are found or not.
    const deletionPromises: Promise<Count>[] = []
    for (const studentId of studentIds) {
      // Check whether the student id is existing or not.
      const isExistedStudent = await this.studentRepository.exists(studentId);
      if (!isExistedStudent) {
        throw new HttpErrors.NotFound("Student not found.")
      }

      // Check whether the student has already enrolled or not.
      const foundEnrollment = await this.enrollmentRepository.findOne({
        where: {
          courseId: id,
          studentId
        }
      })

      if (!foundEnrollment) {
        throw new HttpErrors.NotFound("Student not found in this course.")
      }

      deletionPromises.push(
        this.enrollmentRepository.deleteAll({
          courseId: id,
          studentId
        })
      )
    }

    // execute all promises which is used to remove an enrollment row.
    await Promise.all(deletionPromises);
  }
}
