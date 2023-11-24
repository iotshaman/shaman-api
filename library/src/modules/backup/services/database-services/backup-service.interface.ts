import { DatabaseConfig } from "../../models/shaman-backup.config";

export interface IDatabaseService {
  type: string;
  getBackup: (dbConfig: DatabaseConfig) => Promise<string>;
}
