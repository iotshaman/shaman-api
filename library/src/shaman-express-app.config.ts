export type ShamanExpressAppConfig = {
  configPath?: string;
  port?: number;
  headerAllowList?: string[];
  localOnly?: boolean;
  disableCors?: boolean;
  auth?: {
    tokenSecret?: string;
  }
}