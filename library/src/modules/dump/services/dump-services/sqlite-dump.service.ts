import { DatabaseConfig } from "../../models/shaman-dump.config";
import { IDumpService } from "./dump-service.interface";

export class SqliteDumpService implements IDumpService {

  type: string = 'sqlite';

  getDump = (dbConfig: DatabaseConfig): Promise<string> => {
    if (!this.validConfig(dbConfig))
      return Promise.reject(new Error(`Invalid config for sqlite dump service. Filepath is required.`));
    return Promise.resolve(dbConfig.filepath);
  };

  private validConfig = (dbConfig: DatabaseConfig): boolean => {
    return dbConfig.type === 'sqlite' &&
      dbConfig.filepath !== undefined;
  }

}
