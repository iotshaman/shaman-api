import { Container } from "inversify";
import { ShamanExpressModule, SHAMAN_API_TYPES } from "shaman-api";

import { PROXY_WIDGET_TYPES } from "./proxy-widget.types";
import { ProxyWidgetService } from "./proxy-widget.service";
import { ProxyWidgetController } from "./proxy-widget.controller";

export class ProxyWidgetModule extends ShamanExpressModule {
  name: string = 'proxy-widget';
  compose = (container: Container): Promise<Container> => {
    container.bind<ProxyWidgetService>(PROXY_WIDGET_TYPES.ProxyWidgetService)
      .toConstantValue(new ProxyWidgetService("https://www.iotshaman.com"));
    container.bind<ProxyWidgetController>(SHAMAN_API_TYPES.ApiController).to(ProxyWidgetController);
    return Promise.resolve(container);
  }
}