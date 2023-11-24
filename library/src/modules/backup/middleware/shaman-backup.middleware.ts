import { Request, Response } from "express";
import { ShamanBackupConfig } from "../exports";
import { injectable } from "inversify";

@injectable()
export class ShamanBackupMiddleware {
  constructor(private backupConfig: ShamanBackupConfig) { }

  verifySecureConnection = (req: Request, res: Response, next: any) => {
    if (this.backupConfig.allowUnsecureConnection) return next();
    if (req.secure) return next();
    res.status(403).send('Insecure connection.');
  }
}