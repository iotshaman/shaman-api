import { DatabaseConfig } from "../../models/shaman-dump.config";

export interface IDumpService {
  type: string;
  getDump: (dbConfig: DatabaseConfig) => Promise<string>;
}
