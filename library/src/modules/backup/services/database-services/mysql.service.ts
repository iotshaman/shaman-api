import { exec } from "child_process";
import * as _os from "os";
import { DatabaseConfig } from "../../models/shaman-backup.config";
import { IDatabaseService } from "./backup-service.interface";
import { injectable } from "inversify";

@injectable()
export class MysqlBackupService implements IDatabaseService {

  type: string = 'mysql';

  getBackup = (dbConfig: DatabaseConfig): Promise<string> => {
    if (!this.validConfig(dbConfig))
      return Promise.reject(new Error('Invalid config for mysql backup service. Database name, username and password are required.'));
    return new Promise((resolve, reject) => {
      let tmpDir = _os.tmpdir();
      let command = `mysqldump -u ${dbConfig.username} -p${dbConfig.password} ${dbConfig.name} > ${tmpDir}/${dbConfig.name}.sql`;
      exec(command, (error, _stdout, _stderr) => {
        if (error)
          reject(new Error(error.message));
        resolve(`${tmpDir}/${dbConfig.name}.sql`);
      });
    });
  };

  private validConfig = (dbConfig: DatabaseConfig): boolean => {
    return dbConfig.type === 'mysql' &&
      !!dbConfig.name &&
      !!dbConfig.username &&
      !!dbConfig.password;
  }

}
