import { JsonFileService } from '../services/json.service';

export const ConfigFactory = {
  GenerateConfig: <T = any>(configPath: string): Promise<T> => {
    if (!configPath) return Promise.resolve(<T>{});
    let configService = new JsonFileService();
    return configService.getJson<T>(configPath);
  }
}