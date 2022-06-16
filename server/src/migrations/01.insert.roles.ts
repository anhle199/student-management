import {JSONObject} from '@loopback/core';
import {StudentManagementApplication} from '../application';
import {RoleRepository} from '../repositories';
import {insertCsvToModel} from '../utilities/csv';

export default async function (app: StudentManagementApplication) {
  const roleRepo = await app.getRepository(RoleRepository);

  await insertCsvToModel('roles.csv', async (roleInstance: JSONObject) => {
    const foundRole = await roleRepo.findOne({
      where: {name: roleInstance.name as string}
    });

    if (!foundRole) {
      await roleRepo.create(roleInstance);
    }
  })
}
