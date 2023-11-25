import * as _fs from 'fs';
import { inject, injectable, multiInject } from "inversify";
import { DatabaseConfig, ShamanBackupConfig } from "../models/shaman-backup.config";
import { SHAMAN_BACKUP_TYPES } from '../shaman-backup.types';
import { IDatabaseService } from "./database-services/backup-service.interface";

export interface IShamanBackupService {
  getBackup: (dbName: string) => Promise<string>;
}

@injectable()
export class ShamanBackupService implements IShamanBackupService {

  constructor(
    @inject(SHAMAN_BACKUP_TYPES.BackupConfig) private backupConfig: ShamanBackupConfig,
    @multiInject(SHAMAN_BACKUP_TYPES.DatabaseService) private databaseServices: IDatabaseService[]
  ) { }

  getBackup = async (dbName: string): Promise<string> => {
    let dbConfig: DatabaseConfig = this.getDbConfig(dbName);
    if (!dbConfig) return Promise.reject(new Error(`Database '${dbName}' not found.`));
    let backupService: IDatabaseService = this.databaseServices.find(ds => ds.type === dbConfig.type);
    if (!backupService) return Promise.reject(new Error(`Backup service '${dbConfig.type}' not found.`));
    let backupPath: string = await backupService.getBackup(dbConfig);
    if (!_fs.existsSync(backupPath)) return Promise.reject(new Error(`Backup file '${backupPath}' not found.`));
    return Promise.resolve(backupPath);
  };


  private getDbConfig = (dbName: string): DatabaseConfig => {
    return this.backupConfig.databases
      .find(db => db.name === dbName);
  }

}
