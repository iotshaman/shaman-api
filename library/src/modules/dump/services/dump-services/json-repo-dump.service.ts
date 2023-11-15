import { DatabaseConfig } from "../../models/shaman-dump.config";
import { IDumpService } from "./dump-service.interface";

export class JsonRepoDumpService implements IDumpService {

  type: string = 'json-repo';

  getDump = (dbConfig: DatabaseConfig): Promise<string> => {
    if (!this.validConfig(dbConfig))
      return Promise.reject(new Error(`Invalid config for json-repo dump service. Filepath is required.`));
    return Promise.resolve(dbConfig.filepath);
  };

  private validConfig = (dbConfig: DatabaseConfig): boolean => {
    return dbConfig.type === 'json-repo' &&
      dbConfig.filepath !== undefined;
  }

}
