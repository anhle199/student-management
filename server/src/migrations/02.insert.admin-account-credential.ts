import { JSONObject } from '@loopback/core';
import { StudentManagementApplication } from '../application';
import { RoleEnum } from '../models';
import { AccountRepository, RoleMappingRepository, RoleRepository } from '../repositories';
import { insertCsvToModel } from '../utilities/csv';
import { encrypt } from '../utilities/encrypt';

export default async function (app: StudentManagementApplication) {
  const accountRepo = await app.getRepository(AccountRepository);
  const roleRepo = await app.getRepository(RoleRepository);
  const roleMappingRepo = await app.getRepository(RoleMappingRepository);

  await insertCsvToModel('admin-account-credential.csv', async (adminAccount: JSONObject) => {
    const foundAccount = await accountRepo.findOne({
      where: {username: adminAccount.username as string}
    });

    if (!foundAccount) {
      try {
        // Hash password.
        adminAccount.password = await encrypt(adminAccount.password as string);

        // Create admin account.
        const createdAccount = await accountRepo.create(adminAccount);

        // Assign the `admin` role to admin account.
        const adminRole = await roleRepo.findOne({where: {name: RoleEnum.ADMIN}});
        if (adminRole) {
          await roleMappingRepo.create({accountId: createdAccount.id, roleId: adminRole.id});
        }
      } catch (error) {
        console.log(error);
      }
    }
  })
}

