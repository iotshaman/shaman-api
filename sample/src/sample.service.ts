import { inject, injectable } from 'inversify';
import { SHAMAN_API_TYPES } from 'shaman-api';

@injectable()
export class SampleService {

  constructor(@inject(SHAMAN_API_TYPES.AppConfig) private config: any) {};

  getAppConfig = (): any => {
    return this.config;
  }

}