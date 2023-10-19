import "reflect-metadata";
import * as _path from 'path';
import { SHAMAN_API_TYPES, ShamanExpressApp, ShamanExpressController, ShamanAuthModule } from 'shaman-api';
import { HealthController } from './controllers/health.controller';
import { ProxyWidgetModule } from "./widgets/proxy-widget/proxy-widget.module";
import { SampleService } from "./sample.service";
import { UserController } from "./controllers/user.controller";
import { UserService } from "./services/user.service";

let bootstrap = async () => {
  let configPath = _path.join(__dirname, '..', 'app', 'config.json');
  const app = new ShamanExpressApp({ configPath: configPath, port: 5000 });
  let container = await app.compose();
  container.bind<SampleService>("SampleService").to(SampleService);
  container.bind<UserService>("UserService").to(UserService);
  container.bind<ShamanExpressController>(SHAMAN_API_TYPES.ApiController).to(HealthController);
  container.bind<ShamanExpressController>(SHAMAN_API_TYPES.ApiController).to(UserController);
  app.configureRouter([new ProxyWidgetModule(), new ShamanAuthModule(container.get("UserService"))]);
  await app.startApplication();
}

bootstrap().catch(ex => {
  console.error(ex);
  process.exit(1);
});