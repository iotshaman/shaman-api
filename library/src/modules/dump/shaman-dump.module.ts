import { Container } from "inversify";
import { SHAMAN_API_TYPES } from "../../composition.types";
import { ShamanExpressAppConfig } from "../../shaman-express-app.config";
import { ShamanExpressModule } from "../../shaman-express-module";
import { ShamanDumpController } from "./shaman-dump.controller";
import { ShamanDumpConfig } from "./models/shaman-dump.config";
import { ConfigFactory } from "../../factories/config.factory";
import { SHAMAN_DUMP_TYPES } from "./shaman-dump.types";

export class ShamanDumpModule extends ShamanExpressModule {

  name: string = 'shaman-dump';

  constructor(private configPath?: string) { super(); }

  // TODO: implement this
  compose = (container: Container): Promise<Container> => {
    return this.getDumpConfig(container)
      .then(config => {
        container.bind<ShamanDumpConfig>(SHAMAN_DUMP_TYPES.DumpConfig).toConstantValue(config);
        container.bind<ShamanDumpController>(SHAMAN_API_TYPES.ApiController).to(ShamanDumpController);
        return Promise.resolve(container);
      });
  };

  private getDumpConfig = async (container: Container): Promise<ShamanDumpConfig> => {
    var config;
    if (!!this.configPath) {
      config = await ConfigFactory.GenerateConfig<ShamanDumpConfig>(this.configPath);
    } else {
      config = container.get<ShamanExpressAppConfig>(SHAMAN_API_TYPES.AppConfig).dump;
    }
    if (!config) throw new Error('Dump config not found.');
    return Promise.resolve(config);
  }

}