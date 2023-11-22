/*istanbul ignore file*/
import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError } from "../../models/router-error";
import { ShamanExpressController } from "../../shaman-express-controller";
import { AuthorizeControllerBase } from "../auth/authorize.controller.base";
import { ShamanAuthService } from "../auth/exports";
import { SHAMAN_AUTH_TYPES } from "../auth/shaman-auth.types";
import { DatabaseConfig, ShamanBackupConfig } from "./models/shaman-backup.config";

import { IShamanBackupService, SHAMAN_BACKUP_TYPES } from "./exports";

@injectable()
export class ShamanBackupController extends AuthorizeControllerBase implements ShamanExpressController {

  name: string = 'shaman-backup.controller';

  constructor(
    @inject(SHAMAN_BACKUP_TYPES.BackupConfig) private backupConfig: ShamanBackupConfig,
    @inject(SHAMAN_BACKUP_TYPES.ShamanBackupService) private backupService: IShamanBackupService,
    @inject(SHAMAN_AUTH_TYPES.ShamanAuthService) authService: ShamanAuthService
  ) { super(authService, ['backup']) }

  configure = (express: Application): void => {
    let router = Router();
    router
      .get('/:dbName', this.verifySecureConnection, this.authorize, this.getBackup)

    express.use('/api/backup', router);
  };

  getBackup = (req: Request, res: Response, next: any) => {
    let dbName = req.params.dbName;
    let dbConfig = this.getDbConfig(dbName);
    if (!dbConfig) return next(new RouteError(`Database '${dbName}' not found.`, 400));
    this.backupService.getBackup(dbConfig)
      .then(backup => res.download(backup))
      .catch((ex: Error) => next(new RouteError(ex.message, 500)));
  }

  private getDbConfig = (dbName: string): DatabaseConfig => {
    return this.backupConfig.databases
      .find(db => db.name === dbName);
  }

  private verifySecureConnection = (req: Request, res: Response, next: any) => {
    if (this.backupConfig.allowUnsecureConnection) return next();
    if (req.secure) return next();
    res.status(403).send('Insecure connection.');
  }

}