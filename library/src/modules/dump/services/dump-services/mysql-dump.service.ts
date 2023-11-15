import * as _path from "path";
import { DatabaseConfig } from "../../models/shaman-dump.config";
import { IDumpService } from "./dump-service.interface";
import { exec } from "child_process";

export class MysqlDumpService implements IDumpService {

  type: string = 'mysql';

  getDump = (dbConfig: DatabaseConfig): Promise<string> => {
    if (!this.validConfig(dbConfig))
      return Promise.reject(new Error(`Invalid config for mysql dump service. Database name, username and password are required.`));
    const dumpsFilePath = _path.join(__dirname, '..', '..', 'generated-dumps');
    return new Promise((resolve, reject) => {
      let command = `mysqldump -u ${dbConfig.username} -p${dbConfig.password} ${dbConfig.name} > ${dumpsFilePath}/${dbConfig.name}.sql`;
      exec(command, (error, _stdout, _stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject(error);
        }
        resolve(`${dumpsFilePath}/${dbConfig.name}.sql`);
      });
    });
  };

  private validConfig = (dbConfig: DatabaseConfig): boolean => {
    return dbConfig.type === 'mysql' &&
      dbConfig.name !== undefined &&
      dbConfig.username !== undefined &&
      dbConfig.password !== undefined;
  }

}
