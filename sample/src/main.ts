import * as _path from 'path';
import "reflect-metadata";
import { IJsonService, JsonFileService, SHAMAN_API_TYPES, ShamanAuthModule, ShamanExpressApp, ShamanExpressController } from 'shaman-api';
import { HealthController } from './controllers/health.controller';
import { UserController } from './controllers/user.controller';
import { SampleService } from './sample.service';
import { UserService } from './services/user.service';
import { ProxyWidgetModule } from "./widgets/proxy-widget/proxy-widget.module";
import { SAMPLE_TYPES } from './sample.types';

let bootstrap = async () => {
  let configPath = _path.join(__dirname, '..', 'app', 'config.json');
  const app = new ShamanExpressApp({ configPath: configPath, port: 5000 });
  let container = await app.compose();

  // compose services
  container.bind<IJsonService>(SHAMAN_API_TYPES.ApiService).to(JsonFileService);
  container.bind<SampleService>(SAMPLE_TYPES.SampleService).to(SampleService);
  container.bind<UserService>(SAMPLE_TYPES.UserDao).to(UserService);
  
  // compose controllers
  container.bind<ShamanExpressController>(SHAMAN_API_TYPES.ApiController).to(HealthController);
  container.bind<ShamanExpressController>(SHAMAN_API_TYPES.ApiController).to(UserController);

  await app.configureRouter([new ProxyWidgetModule(), new ShamanAuthModule(container.get(SAMPLE_TYPES.UserDao))]);
  await app.startApplication();
}

bootstrap().catch(ex => {
  console.error(ex);
  process.exit(1);
});