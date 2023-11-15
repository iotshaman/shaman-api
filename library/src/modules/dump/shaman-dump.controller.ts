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
    let dbConfig: DatabaseConfig = this.dumpConfig.databases
      .find(db => db.name === dbName);
    if (!dbConfig) return res.status(404).send(`Database '${dbName}' not found.`);
    this.dumpService.getDump(dbConfig)
      .then(dump => res.download(dump))
      .catch((ex: Error) => next(new RouteError(ex.message, 500)));
  }

  private verifySecureConnection = (req: Request, res: Response, next: any) => {
    if (this.dumpConfig.allowUnsecureConnection) return next();
    if (req.secure) return next();
    res.status(403).send('Insecure connection.');
  }

}