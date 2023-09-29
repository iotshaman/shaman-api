import { inject, injectable, multiInject } from "inversify";
import { Application, Request, Response } from 'express';

import { SHAMAN_API_TYPES } from "./composition.types";
import { ILogger } from "./logger";
import { RouteError } from "./models/router-error";
import { ShamanExpressController } from "./shaman-express-controller";

@injectable()
export class ShamanExpressRouter {

  constructor(
    @inject(SHAMAN_API_TYPES.Logger) private logger: ILogger,
    @multiInject(SHAMAN_API_TYPES.ApiController) private controllers: ShamanExpressController[]) {}

  configure = (express: Application): void => {
    express.all('/api/*', this.logApiRequests);
    this.loadRoutes(express);
  }

  registerGlobalErrorHandler = (express: Application) => {
    express.use((err: RouteError, req: Request, res: Response, next: any) => {
      let message = `${req.method.toUpperCase()} - ${req.url} :: ${err.message}`;
      this.logger.write(message, 'error');
      if (err.statusCode != 401 && err.statusCode != 403) {
        if (err.stack) this.logger.write(err.stack);
      }
      if (!err.statusCode) return next();
      if (!err.sendMessge) return res.status(err.statusCode).send('Server Error');
      return res.status(err.statusCode).send(err.message);
    });
  }

  private logApiRequests = (req: Request, res: Response, next: any) => {
    this.logger.write(`${req.method.toUpperCase()} - ${req.url}`);
    next();
  }

  private loadRoutes = (express: Application) => {
    for (let controller of this.controllers) {
      controller.configure(express);
    }
  }

}