import { Application } from "express";
import { ILogger } from "./logger";

export type ShamanExpressAppConfig = {
  configPath?: string;
  port?: number;
  production?: boolean;
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
  logger?: ILogger;
}