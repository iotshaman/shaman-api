import { Application } from 'express';
import { Container } from "inversify";

import { SHAMAN_API_TYPES } from "./composition.types";
import { ConfigFactory } from "./factories/config.factory";
import { ExpressFactory } from "./factories/express.factory";
import { ILogger, Logger } from "./logger";
import { ShamanExpressAppConfig } from "./shaman-express-app.config";
import { ShamanExpressModule } from "./shaman-express-module";
import { ShamanExpressRouter as Router } from "./shaman-express-router";

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
    let { configPath } = this.config;
    var config = await ConfigFactory.GenerateConfig(configPath);
    container.bind<any>(SHAMAN_API_TYPES.AppConfig).toConstantValue(config);
    container.bind<ILogger>(SHAMAN_API_TYPES.Logger).to(Logger);
    container.bind<Router>(SHAMAN_API_TYPES.ApiRouter).to(Router).inSingletonScope();
    this.app = !this.config.expressFactory ? 
      ExpressFactory.GenerateApplication(this.config) :
      this.config.expressFactory();
    container.bind<Application>(SHAMAN_API_TYPES.ExpressApplication).toConstantValue(this.app);
    this.container = container;
    return container;
  }

  configureRouter = async (modules: ShamanExpressModule[] = []): Promise<Application> => {
    if (!this.container) throw new Error("Please call 'compose' before configuring router.");
    for (let module of modules) {
      let parentContainer = module.isolated ? new Container() : this.container.createChild();
      let moduleContainer = await module.compose(parentContainer);
      let controllers = module.controllers(moduleContainer);
      for (let controller of controllers) controller.configure(this.app);
      if (!module.export) continue;
      module.export(this.container);
    }
    let router = this.container.get<Router>(SHAMAN_API_TYPES.ApiRouter);
    router.configure(this.app);
    router.registerGlobalErrorHandler(this.app);
    return this.app;
  }
  
  /* istanbul ignore next */
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