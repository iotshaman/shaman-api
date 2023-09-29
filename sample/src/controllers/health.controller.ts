/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { injectable, inject } from "inversify";
import { SHAMAN_API_TYPES, ShamanExpressController } from "shaman-api";

@injectable()
export class HealthController implements ShamanExpressController {

  name: string = 'health';

  constructor(@inject(SHAMAN_API_TYPES.AppConfig) private config: any) {}

  configure = (express: Application) => {
    let router = Router();
    router
      .get('/', this.getStatus)

    express.use('/api/health', router);
  }

  getStatus = (_req: Request, res: Response, _next: any) => {
    res.json({status: 'healthy', config: this.config});
  }

}