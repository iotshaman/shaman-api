import { Container } from "inversify";
import { SHAMAN_API_TYPES } from "../../composition.types";
import { ConfigFactory } from "../../factories/config.factory";
import { ShamanExpressAppConfig } from "../../shaman-express-app.config";
import { ShamanExpressModule } from "../../shaman-express-module";
import { SHAMAN_BACKUP_TYPES } from "./exports";
import { ShamanBackupMiddleware } from "./middleware/shaman-backup.middleware";
import { ShamanBackupConfig } from "./models/shaman-backup.config";
import { IDatabaseService } from "./services/database-services/backup-service.interface";
import { JsonRepoBackupService } from "./services/database-services/json-repo.service";
import { MysqlBackupService } from "./services/database-services/mysql.service";
import { SqliteBackupService } from "./services/database-services/sqlite.service";
import { IShamanBackupService, ShamanBackupService } from "./services/shaman-backup.service";
import { ShamanBackupController } from "./shaman-backup.controller";

/* istanbul ignore next */
export class ShamanBackupModule extends ShamanExpressModule {

  name: string = 'shaman-backup';
  private childContainer: Container;

  constructor(private configPath?: string) { super(); }

  compose = async (container: Container): Promise<Container> => {
    let backupConfig: ShamanBackupConfig = await this.getBackupConfig(container);
    container.bind<ShamanBackupConfig>(SHAMAN_BACKUP_TYPES.BackupConfig)
      .toConstantValue(backupConfig);
    container.bind<IDatabaseService>(SHAMAN_BACKUP_TYPES.DatabaseService).to(JsonRepoBackupService);
    container.bind<IDatabaseService>(SHAMAN_BACKUP_TYPES.DatabaseService).to(MysqlBackupService);
    container.bind<IDatabaseService>(SHAMAN_BACKUP_TYPES.DatabaseService).to(SqliteBackupService);
    container.bind<IShamanBackupService>(SHAMAN_BACKUP_TYPES.ShamanBackupService).to(ShamanBackupService);
    container.bind<ShamanBackupMiddleware>(SHAMAN_BACKUP_TYPES.BackupMiddleware).to(ShamanBackupMiddleware);
    container.bind<ShamanBackupController>(SHAMAN_API_TYPES.ApiController).to(ShamanBackupController);
    this.childContainer = container;
    return Promise.resolve(container);
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