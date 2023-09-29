import "reflect-metadata";
import * as _path from 'path';
import { SHAMAN_API_TYPES, ShamanExpressApp, ShamanExpressController } from 'shaman-api';
import { HealthController } from './controllers/health.controller';
import { ProxyWidgetModule } from "./widgets/proxy-widget/proxy-widget.module";

let bootstrap = async () => {
  let configPath = _path.join(__dirname, '..', 'app', 'config.json');
  const app = new ShamanExpressApp({configPath: configPath, port: 5000});
  let container = await app.compose();
  container.bind<ShamanExpressController>(SHAMAN_API_TYPES.ApiController).to(HealthController);
  app.configureRouter([new ProxyWidgetModule()]);
  await app.startApplication();
}

bootstrap().catch(ex => {
  console.error(ex);
  process.exit(1);
});