import { DatabaseConfig } from "../../models/shaman-backup.config";
import { IBackupService } from "./backup-service.interface";

export class JsonRepoBackupService implements IBackupService {

  type: string = 'json-repo';

  getBackup = (dbConfig: DatabaseConfig): Promise<string> => {
    if (!this.validConfig(dbConfig))
      return Promise.reject(new Error(`Invalid config for json-repo backup service. Filepath is required.`));
    return Promise.resolve(dbConfig.filepath);
  };

  private validConfig = (dbConfig: DatabaseConfig): boolean => {
    return dbConfig.type === 'json-repo' &&
      !!dbConfig.filepath;
  }

}
