/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { injectable, inject } from "inversify";
import { RouteError, ShamanExpressController } from "shaman-api";

import { PROXY_WIDGET_TYPES } from "./proxy-widget.types";
import { ProxyWidgetService } from "./proxy-widget.service";

@injectable()
export class ProxyWidgetController implements ShamanExpressController {

  name: string = 'proxy-widget';

  @inject(PROXY_WIDGET_TYPES.ProxyWidgetService) 
  private proxyService: ProxyWidgetService;

  configure = (express: Application) => {
    let router = Router();
    router
      .get('/', this.getStatus)

    express.use('/api/proxy', router);
  }

  getStatus = (_req: Request, res: Response, next: any) => {
    return this.proxyService.getWebPage('')
      .then(rslt => res.status(200).send(rslt))
      .catch(ex => new RouteError(ex.message, 500));
  }

}