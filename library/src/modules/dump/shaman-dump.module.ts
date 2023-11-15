import { Container } from "inversify";
import { SHAMAN_API_TYPES } from "../../composition.types";
import { ConfigFactory } from "../../factories/config.factory";
import { ShamanExpressAppConfig } from "../../shaman-express-app.config";
import { ShamanExpressModule } from "../../shaman-express-module";
import { ShamanDumpConfig } from "./models/shaman-dump.config";
import { IShamanDumpService, ShamanDumpService } from "./services/shaman-dump.service";
import { ShamanDumpController } from "./shaman-dump.controller";
import { SHAMAN_DUMP_TYPES } from "./shaman-dump.types";

/*istanbul ignore next*/
export class ShamanDumpModule extends ShamanExpressModule {

  name: string = 'shaman-dump';
  private childContainer: Container;

  constructor(private configPath?: string) { super(); }

  compose = (container: Container): Promise<Container> => {
    return this.getDumpConfig(container)
      .then(config => {
        container.bind<ShamanDumpConfig>(SHAMAN_DUMP_TYPES.DumpConfig).toConstantValue(config);
        container.bind<ShamanDumpController>(SHAMAN_API_TYPES.ApiController).to(ShamanDumpController);
        container.bind<IShamanDumpService>(SHAMAN_DUMP_TYPES.ShamanDumpService)
          .toConstantValue(new ShamanDumpService());
        this.childContainer = container;
        return Promise.resolve(container);
      });
  };

  export = async (container: Container): Promise<void> => {
    container.bind<IShamanDumpService>(SHAMAN_DUMP_TYPES.ShamanDumpService)
      .toDynamicValue(() => {
        return this.childContainer.get<IShamanDumpService>(SHAMAN_DUMP_TYPES.ShamanDumpService);
      });
  }


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