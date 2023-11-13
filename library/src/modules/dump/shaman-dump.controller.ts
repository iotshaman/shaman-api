import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { ShamanExpressController } from "../../shaman-express-controller";
import { ShamanDumpConfig } from "./models/shaman-dump.config";
import { SHAMAN_DUMP_TYPES } from "./shaman-dump.types";

@injectable()
export class ShamanDumpController implements ShamanExpressController {

  name: string = 'shaman-dump.controller';

  constructor(
    @inject(SHAMAN_DUMP_TYPES.DumpConfig) private dumpConfig: ShamanDumpConfig,
  ) { }

  configure = (express: Application): void => {
    let router = Router();
    router
      .get('/:dbName', this.verifyConnection, this.createDump)

    express.use('/api/dump', router);
  };

  createDump = (req: Request, res: Response, next: any) => {
    res.json({
      message: 'Hello from dump'
    });
  }

  private verifyConnection = (req: Request, res: Response, next: any) => {
    if (this.dumpConfig.allowInsecureConnection) return next();
    if (req.secure) return next();
    res.status(403).send('Insecure connection.');
  }

}