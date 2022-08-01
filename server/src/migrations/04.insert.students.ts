import {StudentManagementApplication} from '../application';
import {GenderEnum, RoleEnum, Student} from '../models';
import {AccountRepository, RoleMappingRepository, RoleRepository, StudentRepository} from '../repositories';
import {insertCsvToModel} from '../utilities/csv';
import {encrypt} from '../utilities/encrypt';

type StudentsDataCSV = {
  code: string,
  name: string,
  gender: string, // map to GenderEnum
  phone: string,
  universityClassId: string,
  isMonitor: string, // '0' is false, '1' is true
}

export default async function (app: StudentManagementApplication) {
  const roleRepo = await app.getRepository(RoleRepository);
  const roleMappingRepo = await app.getRepository(RoleMappingRepository);

  const studentMemberRole = await roleRepo.findOne({where: {name: RoleEnum.STUDENT_MEMBER}});
  const studentMonitorRole = await roleRepo.findOne({where: {name: RoleEnum.STUDENT_MONITOR}});

  if (studentMemberRole && studentMonitorRole) {
    const studentRepo = await app.getRepository(StudentRepository);
    const accountRepo = await app.getRepository(AccountRepository);

    await insertCsvToModel("students.csv", async (row: StudentsDataCSV) => {
      const student = new Student({
        code: row.code,
        name: row.name,
        gender: row.gender === '1' ? GenderEnum.MALE : GenderEnum.FEMALE,
        phone: row.phone.length === 10 ? row.phone : undefined,
        universityClassId: row.universityClassId === '-1' ? undefined : Number(row.universityClassId),
        isMonitor: row.isMonitor === '1'
      });

      // Create where condition statement to find students that satisfy the above condition.
      const whereStatement = {where: {}};
      if (student.phone) {
        whereStatement.where = {
          or: [
            {code: student.code},
            {phone: student.phone},
          ],
        }
      } else {
        whereStatement.where = {code: student.code}
      }

      // Find students that satisfy the above condition.
      const foundStudents = await studentRepo.find(whereStatement)

      if (foundStudents.length === 0) {
        // insert student into the database
        const insertedStudent = await studentRepo.create(student);

        // hash password
        const encryptedPassword = await encrypt(student.code);

        // insert account into the database
        const insertedAccount = await accountRepo.create({
          username: student.code,
          password: encryptedPassword,
          studentId: insertedStudent.id,
        });

        // insert `student_member` role for this student into the database
        await roleMappingRepo.create({
          roleId: studentMemberRole.id,
          accountId: insertedAccount.id,
        })

        // insert `student_monitor` role for this student into the database
        if (student.isMonitor) {
          await roleMappingRepo.create({
            roleId: studentMonitorRole.id,
            accountId: insertedAccount.id,
          })
        }
      }
    })
  }
}
