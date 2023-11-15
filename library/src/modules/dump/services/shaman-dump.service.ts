import { injectable } from "inversify";
import { DatabaseConfig } from "../models/shaman-dump.config";
import { IDumpService } from "./dump-services/dump-service.interface";
import { JsonRepoDumpService } from "./dump-services/json-repo-dump.service";
import { MysqlDumpService } from "./dump-services/mysql-dump.service";
import { SqliteDumpService } from "./dump-services/sqlite-dump.service";
import * as _fs from 'fs';

export interface IShamanDumpService {
  getDump: (dbConfig: DatabaseConfig) => Promise<string>;
}

@injectable()
export class ShamanDumpService implements IShamanDumpService {

  constructor() { }

  dumpServiceFactory: IDumpService[] = [
    new JsonRepoDumpService(),
    new MysqlDumpService(),
    new SqliteDumpService()
  ]

  getDump = (dbConfig: DatabaseConfig): Promise<string> => {
    let dumpService = this.dumpServiceFactory.find(ds => ds.type === dbConfig.type);
    if (!dumpService) return Promise.reject(new Error(`Dump service '${dbConfig.type}' not found.`));
    return dumpService.getDump(dbConfig)
      .then(dump => {
        if (!_fs.existsSync(dump))
          throw new Error(`Dump file '${dump}' not found.`);
        return dump;
      });
  };

}
