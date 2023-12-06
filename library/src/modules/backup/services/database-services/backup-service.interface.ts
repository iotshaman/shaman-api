import { DatabaseConfig } from "../../models/shaman-backup.config";

export interface IDatabaseService {
  type: string;
  getBackupFilePath: (dbConfig: DatabaseConfig) => Promise<string>;
}
