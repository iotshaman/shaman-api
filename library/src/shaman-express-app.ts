import { Container } from "inversify";
import { Application } from 'express';

import { ShamanExpressAppConfig } from "./shaman-express-app.config";
import { ConfigFactory } from "./factories/config.factory";
import { SHAMAN_API_TYPES } from "./composition.types";
import { ILogger, Logger } from "./logger";
import { ShamanExpressRouter as Router } from "./shaman-express-router";
import { ShamanExpressModule } from "./shaman-express-module";
import { ExpressFactory } from "./factories/express.factory";

export class ShamanExpressApp {

  private config: ShamanExpressAppConfig;
  private container: Container;
  private app: Application;
  private serverStarted: boolean = false;
  private defaultConfig: ShamanExpressAppConfig = {
    port: 5000
  };

  constructor(config: ShamanExpressAppConfig = null) {
    this.config = config || this.defaultConfig;
  }

  compose = async (): Promise<Container> => {
    const container = new Container();
    let {configPath} = this.config;
    var config = await ConfigFactory.GenerateConfig(configPath);
    container.bind<any>(SHAMAN_API_TYPES.AppConfig).toConstantValue(config);
    container.bind<ILogger>(SHAMAN_API_TYPES.Logger).to(Logger);
    container.bind<Router>(SHAMAN_API_TYPES.ApiRouter).to(Router).inSingletonScope();
    this.container = container;
    return container;
  }

  configureRouter = async (modules: ShamanExpressModule[] = []): Promise<void> => {
    if (!!this.app) return;
    if (!this.container) throw new Error("Please call 'compose' before configuring router.");
    this.app = ExpressFactory.GenerateApplication(this.config);
    let router = this.container.get<Router>(SHAMAN_API_TYPES.ApiRouter);
    router.configure(this.app);
    for (let module of modules) {
      let moduleContainer = await module.compose(new Container());
      let controllers = module.controllers(moduleContainer);
      for (let controller of controllers) controller.configure(this.app);
      if (!module.export) continue;
      module.export(this.container);
    }
    router.registerGlobalErrorHandler(this.app);
  }

  startApplication = (): Promise<void> => {
    return new Promise((res) => {
      if (this.serverStarted) return res();
      let logger = this.container.get<ILogger>(SHAMAN_API_TYPES.Logger);
      let callback = () => {
        logger.write(`Express server listening on port ${this.config.port}`);
        this.serverStarted = true;
        res();
      }
      if (!this.config.localOnly) this.app.listen(this.config.port, callback);
      else this.app.listen(this.config.port, 'localhost', callback);
    });
  }

}