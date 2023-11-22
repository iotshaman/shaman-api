import * as _fs from 'fs';
import { injectable } from "inversify";
import { DatabaseConfig } from "../models/shaman-backup.config";
import { IBackupService } from "./backup-services/backup-service.interface";
import { JsonRepoBackupService } from "./backup-services/json-repo-backup.service";
import { MysqlBackupService } from "./backup-services/mysql-backup.service";
import { SqliteBackupService } from "./backup-services/sqlite-backup.service";

export interface IShamanBackupService {
  getBackup: (dbConfig: DatabaseConfig) => Promise<string>;
}

@injectable()
export class ShamanBackupService implements IShamanBackupService {

  constructor() { }

  backupServicesArray: IBackupService[] = [
    new JsonRepoBackupService(),
    new MysqlBackupService(),
    new SqliteBackupService()
  ]

  getBackup = (dbConfig: DatabaseConfig): Promise<string> => {
    let backupService = this.backupServicesArray.find(ds => ds.type === dbConfig.type);
    if (!backupService) return Promise.reject(new Error(`Backup service '${dbConfig.type}' not found.`));
    return backupService.getBackup(dbConfig)
      .then(backup => {
        if (!_fs.existsSync(backup))
          throw new Error(`Backup file '${backup}' not found.`);
        return backup;
      });
  };

}
