import { Container } from "inversify";
import { SHAMAN_API_TYPES, ShamanExpressAppConfig, ShamanExpressModule } from "../..";
import { IUserDao } from "./models/user.dao";
import { IShamanAuthService, ShamanAuthService } from "./services/shaman-auth.service";
import { ITokenService, TokenService } from "./services/token.service";
import { IUserService, UserService } from "./services/user.service";
import { ShamanAuthController } from "./shaman-auth.controller";
import { SHAMAN_AUTH_TYPES } from "./shaman-auth.types";

/*istanbul ignore next*/
export class ShamanAuthModule extends ShamanExpressModule {
  name: string = 'shaman-auth';
  childContainer: Container;

  constructor(private userDao: IUserDao) { super(); }

  compose = (container: Container): Promise<Container> => {
    var config = container.get<ShamanExpressAppConfig>(SHAMAN_API_TYPES.AppConfig);
    container.bind<IShamanAuthService>(SHAMAN_AUTH_TYPES.ShamanAuthService)
      .toConstantValue(new ShamanAuthService(config.auth.tokenSecret));
    container.bind<IUserService>(SHAMAN_AUTH_TYPES.UserService)
      .toConstantValue(new UserService(this.userDao));
    container.bind<ITokenService>(SHAMAN_AUTH_TYPES.TokenService)
      .toConstantValue(new TokenService(config.auth.tokenSecret, this.getUserService(container)));
    container.bind<ShamanAuthController>(SHAMAN_API_TYPES.ApiController).to(ShamanAuthController);
    this.childContainer = container;
    return Promise.resolve(container);
  }

  export = async (container: Container): Promise<void> => {
    container.bind<ITokenService>(SHAMAN_AUTH_TYPES.TokenService)
      .toDynamicValue(() => {
        return this.childContainer.get<ITokenService>(SHAMAN_AUTH_TYPES.TokenService);
      });
    container.bind<IUserService>(SHAMAN_AUTH_TYPES.UserService)
      .toDynamicValue(() => {
        return this.childContainer.get<IUserService>(SHAMAN_AUTH_TYPES.UserService);
      });
    container.bind<IShamanAuthService>(SHAMAN_AUTH_TYPES.ShamanAuthService)
      .toDynamicValue(() => {
        return this.childContainer.get<IShamanAuthService>(SHAMAN_AUTH_TYPES.ShamanAuthService);
      });
  }

  private getUserService = (container: Container): UserService => {
    return container.get<UserService>(SHAMAN_AUTH_TYPES.UserService);
  }
}