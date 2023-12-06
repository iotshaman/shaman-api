import { Request, Response } from "express";
import { SHAMAN_BACKUP_TYPES, ShamanBackupConfig } from "../exports";
import { inject, injectable } from "inversify";

@injectable()
export class ShamanBackupMiddleware {
  constructor(
    @inject(SHAMAN_BACKUP_TYPES.BackupConfig) private backupConfig: ShamanBackupConfig
  ) { }

  verifySecureConnection = (req: Request, res: Response, next: any) => {
    if (this.backupConfig.allowUnsecureConnection) return next();
    if (req.secure) return next();
    res.status(403).send('Insecure connection.');
  }
}