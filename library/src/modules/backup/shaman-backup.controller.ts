/* istanbul ignore file */
import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError } from "../../models/router-error";
import { ShamanExpressController } from "../../shaman-express-controller";
import { AuthorizeControllerBase } from "../auth/authorize.controller.base";
import { ShamanAuthService } from "../auth/exports";
import { SHAMAN_AUTH_TYPES } from "../auth/shaman-auth.types";
import { ShamanBackupMiddleware } from "./middleware/shaman-backup.middleware";
import { IShamanBackupService } from "./services/shaman-backup.service";
import { SHAMAN_BACKUP_TYPES } from "./shaman-backup.types";

@injectable()
export class ShamanBackupController extends AuthorizeControllerBase implements ShamanExpressController {

  name: string = 'shaman-backup.controller';

  constructor(
    @inject(SHAMAN_BACKUP_TYPES.BackupMiddleware) private middleware: ShamanBackupMiddleware,
    @inject(SHAMAN_BACKUP_TYPES.ShamanBackupService) private backupService: IShamanBackupService,
    @inject(SHAMAN_AUTH_TYPES.ShamanAuthService) authService: ShamanAuthService
  ) { super(authService, ['backup']) }

  configure = (express: Application): void => {
    let router = Router();
    router
      .get('/:dbName', this.middleware.verifySecureConnection, this.authorize, this.getBackup)

    express.use('/api/backup', router);
  };

  getBackup = (req: Request, res: Response, next: any) => {
    let dbName = req.params.dbName;
    if (!dbName) return next(new RouteError(`Database name is required.`, 400));
    this.backupService.getBackupFilePath(dbName)
      .then(backup => res.download(backup))
      .catch((ex: Error) => next(new RouteError(ex.message, 500)));
  }

}