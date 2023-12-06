import { injectable } from "inversify";
import { DatabaseConfig } from "../../models/shaman-backup.config";
import { IDatabaseService } from "./backup-service.interface";

@injectable()
export class JsonRepoBackupService implements IDatabaseService {

  type: string = 'json-repo';

  getBackupFilePath = (dbConfig: DatabaseConfig): Promise<string> => {
    if (!this.validConfig(dbConfig))
      return Promise.reject(new Error(`Invalid config for json-repo backup service. Filepath is required.`));
    return Promise.resolve(dbConfig.filepath);
  };

  private validConfig = (dbConfig: DatabaseConfig): boolean => {
    return dbConfig.type === 'json-repo' &&
      !!dbConfig.filepath;
  }

}
