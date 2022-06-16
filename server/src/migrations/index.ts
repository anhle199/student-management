import {StudentManagementApplication} from '../application';
import {MigrationRepository} from '../repositories/migration.repository';
import insertRoles from './01.insert.roles';
import insertAdminAccountCredential from './02.insert.admin-account-credential';

export async function migrations(app: StudentManagementApplication) {
  const migrationRepo = await app.getRepository(MigrationRepository);
  const migrationList: {name: string, migration: Function}[] = [
    {name: "01.insert.roles", migration: insertRoles},
    {name: "02.insert.admin-account-credential", migration: insertAdminAccountCredential},
  ];

  for (const migration of migrationList) {
    const foundMigration = await migrationRepo.findOne({where: {name: migration.name}});
    if (!foundMigration ) {
      console.log(`>>> Start migration ${migration.name}`);
      await migration.migration(app);
      await migrationRepo.create({name: migration.name});
      console.log(`>>> Done migration ${migration.name}`);
    }
  }
}
