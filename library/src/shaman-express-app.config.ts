import { ShamanDumpConfig } from "./modules/dump/exports";

export type ShamanExpressAppConfig = {
  configPath?: string;
  port?: number;
  headerAllowList?: string[];
  localOnly?: boolean;
  disableCors?: boolean;
  auth?: {
    tokenSecret: string;
  };
  dump?: ShamanDumpConfig;
}