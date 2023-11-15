import { injectable } from "inversify";
import { DatabaseConfig } from "../models/shaman-dump.config";
import { IDumpService } from "./dump-services/dump-service.interface";
import { JsonRepoDumpService } from "./dump-services/json-repo-dump.service";
import { SqliteDumpService } from "./dump-services/sqlite-dump.service";

export interface IShamanDumpService {
  getDump: (dbConfig: DatabaseConfig) => Promise<string>;
}

@injectable()
export class ShamanDumpService implements IShamanDumpService {

  constructor() { }

  private dumpServiceFactory: IDumpService[] = [
    new SqliteDumpService(),
    new JsonRepoDumpService()
  ]

  getDump = (dbConfig: DatabaseConfig): Promise<string> => {
    let dumpService = this.dumpServiceFactory.find(ds => ds.type === dbConfig.type);
    if (!dumpService) return Promise.reject(new Error(`Dump service '${dbConfig.type}' not found.`));
    return dumpService.getDump(dbConfig);
  };

}