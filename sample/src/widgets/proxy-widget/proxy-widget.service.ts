import { HttpService } from "shaman-api";

export class ProxyWidgetService extends HttpService {

  constructor(apiBaseUri: string) {
    super(apiBaseUri);
  }

  getWebPage = (url: string): Promise<string> => {
    return this.getHtml(url);
  }

}