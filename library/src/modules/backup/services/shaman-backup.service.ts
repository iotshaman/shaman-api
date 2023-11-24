import * as _fs from 'fs';
import { injectable } from "inversify";
import { DatabaseConfig, ShamanBackupConfig } from "../models/shaman-backup.config";
import { IBackupService } from "./backup-services/backup-service.interface";
import { JsonRepoBackupService } from "./backup-services/json-repo-backup.service";
import { MysqlBackupService } from "./backup-services/mysql-backup.service";
import { SqliteBackupService } from "./backup-services/sqlite-backup.service";

export interface IShamanBackupService {
  getBackup: (dbName: string) => Promise<string>;
}

@injectable()
export class ShamanBackupService implements IShamanBackupService {

  constructor(private backupConfig: ShamanBackupConfig) { }

  backupServicesArray: IBackupService[] = [
    new JsonRepoBackupService(),
    new MysqlBackupService(),
    new SqliteBackupService()
  ]

  getBackup = async (dbName: string): Promise<string> => {
    let dbConfig: DatabaseConfig = this.getDbConfig(dbName);
    if (!dbConfig) return Promise.reject(new Error(`Database '${dbName}' not found.`));
    let backupService: IBackupService = this.backupServicesArray.find(ds => ds.type === dbConfig.type);
    if (!backupService) return Promise.reject(new Error(`Backup service '${dbConfig.type}' not found.`));
    let backupPath: string = await backupService.getBackup(dbConfig);
    if (!_fs.existsSync(backupPath))
      throw new Error(`Backup file '${backupPath}' not found.`);
    return Promise.resolve(backupPath);
  };

  
  private getDbConfig = (dbName: string): DatabaseConfig => {
    return this.backupConfig.databases
      .find(db => db.name === dbName);
  }

}
