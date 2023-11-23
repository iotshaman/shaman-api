import { DatabaseConfig } from "../../models/shaman-backup.config";
import { IBackupService } from "./backup-service.interface";

export class SqliteBackupService implements IBackupService {

  type: string = 'sqlite';

  getBackup = (dbConfig: DatabaseConfig): Promise<string> => {
    if (!this.validConfig(dbConfig))
      return Promise.reject(new Error(`Invalid config for sqlite backup service. Filepath is required.`));
    return Promise.resolve(dbConfig.filepath);
  };

  private validConfig = (dbConfig: DatabaseConfig): boolean => {
    return dbConfig.type === 'sqlite' &&
      !!dbConfig.filepath;
  }

}
