/*istanbul ignore file*/
import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { ShamanExpressController } from "../../shaman-express-controller";
import { DatabaseConfig, ShamanDumpConfig } from "./models/shaman-dump.config";
import { IShamanDumpService } from "./services/shaman-dump.service";
import { SHAMAN_DUMP_TYPES } from "./shaman-dump.types";
import { RouteError } from "../../models/router-error";

@injectable()
export class ShamanDumpController implements ShamanExpressController {

  name: string = 'shaman-dump.controller';

  constructor(
    @inject(SHAMAN_DUMP_TYPES.DumpConfig) private dumpConfig: ShamanDumpConfig,
    @inject(SHAMAN_DUMP_TYPES.ShamanDumpService) private dumpService: IShamanDumpService
  ) { }

  configure = (express: Application): void => {
    let router = Router();
    router
      .get('/:dbName', this.verifySecureConnection, this.createDump)

    express.use('/api/dump', router);
  };

  createDump = (req: Request, res: Response, next: any) => {
    let dbName = req.params.dbName;
    let dbConfig = this.getDbConfig(dbName);
    if (!dbConfig) return next(new RouteError(`Database '${dbName}' not found.`, 400));
    this.dumpService.getDump(dbConfig)
      .then(dump => res.download(dump))
      .catch((ex: Error) => next(new RouteError(ex.message, 500)));
  }

  private getDbConfig = (dbName: string): DatabaseConfig => {
    return this.dumpConfig.databases
      .find(db => db.name === dbName);
  }

  private verifySecureConnection = (req: Request, res: Response, next: any) => {
    if (this.dumpConfig.allowUnsecureConnection) return next();
    if (req.secure) return next();
    res.status(403).send('Insecure connection.');
  }

}