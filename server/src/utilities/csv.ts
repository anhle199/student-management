import csv from 'csvtojson';
import path from 'path';
import {templateBasePath} from '../migrations/base-path';

export default async function loadCsv(fileName: string) {
  const jsonArray = await csv().fromFile(fileName)
  return jsonArray
}

export async function insertCsvToModel(fileName: string, insertFunction: Function) {
  console.log(`Creating models from csv file: ${fileName}`);
  const file = path.resolve(templateBasePath, fileName);
  const data = await loadCsv(file);

  for (const row of data) {
    await insertFunction(row);
  }
}

