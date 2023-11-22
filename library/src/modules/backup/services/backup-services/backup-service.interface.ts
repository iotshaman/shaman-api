import { DatabaseConfig } from "../../models/shaman-backup.config";

export interface IBackupService {
  type: string;
  getBackup: (dbConfig: DatabaseConfig) => Promise<string>;
}
