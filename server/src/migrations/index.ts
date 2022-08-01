import {StudentManagementApplication} from '../application';
import {MigrationRepository} from '../repositories/migration.repository';

// insertion functions
import insertRoles from './01.insert.roles';
import insertAdminAccountCredential from './02.insert.admin-account-credential';
import insertClasses from './03.insert.classes';
import insertStudents from './04.insert.students';

export async function migratePreparedData(app: StudentManagementApplication) {
  const migrationRepo = await app.getRepository(MigrationRepository);
  const migrationList: {name: string, migration: Function}[] = [
    {name: "01.insert.roles", migration: insertRoles},
    {name: "02.insert.admin-account-credential", migration: insertAdminAccountCredential},
    {name: "03.insert.classes", migration: insertClasses},
    {name: "04.insert.students", migration: insertStudents},
  ];

  for (const migration of migrationList) {
    const foundMigration = await migrationRepo.findOne({where: {name: migration.name}});
    if (!foundMigration ) {
      console.log(`>>> Start migration ${migration.name}`);
      await migration.migration(app);
      await migrationRepo.create({name: migration.name});
      console.log(`>>> Done migration ${migration.name}\n`);
    }
  }
}
