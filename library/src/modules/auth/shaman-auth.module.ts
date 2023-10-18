import { Container } from "inversify";
import { SHAMAN_API_TYPES, ShamanExpressAppConfig, ShamanExpressModule } from "../..";
import { IUserDao } from "./models/user.dao";
import { ShamanAuthService } from "./services/shaman-auth.service";
import { TokenService } from "./services/token.service";
import { UserService } from "./services/user.service";
import { ShamanAuthController } from "./shaman-auth.controller";
import { SHAMAN_AUTH_TYPES } from "./shaman-auth.types";

export class ShamanAuthModule extends ShamanExpressModule {
  name: string = 'shaman-auth';

  // TODO: REMOVE THIS
  constructor(private userDao: IUserDao) { super(); }

  compose = (container: Container): Promise<Container> => {
    var config = container.get<ShamanExpressAppConfig>(SHAMAN_API_TYPES.AppConfig);
    container.bind<ShamanAuthService>(SHAMAN_AUTH_TYPES.ShamanAuthService)
      .toConstantValue(new ShamanAuthService(config.tokenSecret));
    container.bind<UserService>(SHAMAN_AUTH_TYPES.UserService)
      .toConstantValue(new UserService(this.userDao));
    container.bind<TokenService>(SHAMAN_AUTH_TYPES.TokenService)
      .toConstantValue(new TokenService(config.tokenSecret, this.getUserService(container)));
    container.bind<ShamanAuthController>(SHAMAN_API_TYPES.ApiController).to(ShamanAuthController);
    return Promise.resolve(container);
  }

  private getUserService = (container: Container): UserService => {
    return container.get<UserService>(SHAMAN_AUTH_TYPES.UserService);
  }
}