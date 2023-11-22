import { ShamanBackupConfig } from "./modules/backup/exports";

export type ShamanExpressAppConfig = {
  configPath?: string;
  port?: number;
  headerAllowList?: string[];
  localOnly?: boolean;
  disableCors?: boolean;
  auth?: {
    tokenSecret: string;
  };
  backup?: ShamanBackupConfig;
}