import { Application } from "express";

export type ShamanExpressAppConfig = {
  configPath?: string;
  port?: number;
  headerAllowList?: string[];
  localOnly?: boolean;
  disableCors?: boolean;
  auth?: {
    tokenSecret?: string;
  };
  bodyParser?: {
    limit: string;
    extended?: boolean;
    parameters?: number;
  };
  expressFactory?: () => Application;
}