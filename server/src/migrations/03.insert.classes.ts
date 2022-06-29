import {JSONObject} from '@loopback/core';
import {StudentManagementApplication} from '../application';
import {UniversityClassRepository} from '../repositories';
import {insertCsvToModel} from '../utilities/csv';

export default async function (app: StudentManagementApplication) {
    const classRepo = await app.getRepository(UniversityClassRepository);

    await insertCsvToModel("classes.csv", async (universityClass: JSONObject) => {
        const foundClass = await classRepo.findOne({
            where: {name: universityClass.name as string}
        });

        if (!foundClass) {
            await classRepo.create(universityClass);
        }
    })
}
