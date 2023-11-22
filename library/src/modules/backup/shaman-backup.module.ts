import { Container } from "inversify";
import { ConfigFactory } from "../../factories/config.factory";
import { ShamanExpressAppConfig } from "../../shaman-express-app.config";
import { ShamanExpressModule } from "../../shaman-express-module";
import { ShamanBackupConfig } from "./models/shaman-backup.config";
import { IShamanBackupService, ShamanBackupService } from "./services/shaman-backup.service";
import { ShamanBackupController } from "./shaman-backup.controller";
import { SHAMAN_API_TYPES } from "../../composition.types";
import { SHAMAN_BACKUP_TYPES } from "./exports";

/*istanbul ignore next*/
export class ShamanBackupModule extends ShamanExpressModule {

  name: string = 'shaman-backup';
  private childContainer: Container;

  constructor(private configPath?: string) { super(); }

  compose = (container: Container): Promise<Container> => {
    return this.getBackupConfig(container)
      .then(config => {
        container.bind<ShamanBackupConfig>(SHAMAN_BACKUP_TYPES.BackupConfig).toConstantValue(config);
        container.bind<ShamanBackupController>(SHAMAN_API_TYPES.ApiController).to(ShamanBackupController);
        container.bind<IShamanBackupService>(SHAMAN_BACKUP_TYPES.ShamanBackupService)
          .toConstantValue(new ShamanBackupService());
        this.childContainer = container;
        return Promise.resolve(container);
      });
  };

  export = async (container: Container): Promise<void> => {
    container.bind<IShamanBackupService>(SHAMAN_BACKUP_TYPES.ShamanBackupService)
      .toDynamicValue(() => {
        return this.childContainer.get<IShamanBackupService>(SHAMAN_BACKUP_TYPES.ShamanBackupService);
      });
  }


  private getBackupConfig = async (container: Container): Promise<ShamanBackupConfig> => {
    var config;
    if (!!this.configPath) {
      config = await ConfigFactory.GenerateConfig<ShamanBackupConfig>(this.configPath);
    } else {
      config = container.get<ShamanExpressAppConfig>(SHAMAN_API_TYPES.AppConfig).backup;
    }
    if (!config) throw new Error('Backup config not found.');
    return Promise.resolve(config);
  }

}