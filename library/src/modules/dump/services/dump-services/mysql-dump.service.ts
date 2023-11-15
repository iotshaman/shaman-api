import { exec } from "child_process";
import * as _os from "os";
import { DatabaseConfig } from "../../models/shaman-dump.config";
import { IDumpService } from "./dump-service.interface";

export class MysqlDumpService implements IDumpService {

  type: string = 'mysql';


  getDump = (dbConfig: DatabaseConfig): Promise<string> => {
    if (!this.validConfig(dbConfig))
      return Promise.reject(new Error(`Invalid config for mysql dump service. Database name, username and password are required.`));
    return new Promise((resolve, reject) => {
      let tmpDir = _os.tmpdir();
      let command = `mysqldump -u ${dbConfig.username} -p${dbConfig.password} ${dbConfig.name} > ${tmpDir}/${dbConfig.name}.sql`;
      exec(command, (error, _stdout, _stderr) => {
        if (error) {
          console.error(`exec error: ${error}`);
          reject(error);
        }
        resolve(`${tmpDir}/${dbConfig.name}.sql`);
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
