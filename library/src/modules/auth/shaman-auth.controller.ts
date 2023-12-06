import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError } from "../../models/router-error";
import { ShamanExpressController } from "../../shaman-express-controller";
import { TokenRequest } from "./models/auth/token-request";
import { UserPassport } from "./models/auth/user-passport";
import { IShamanAuthService } from "./services/shaman-auth.service";
import { ITokenService } from "./services/token.service";
import { IUserService } from "./services/user.service";
import { SHAMAN_AUTH_TYPES } from "./shaman-auth.types";

/*istanbul ignore next*/
@injectable()
export class ShamanAuthController implements ShamanExpressController {

  name: string = 'shaman-auth.controller';

  constructor(
    @inject(SHAMAN_AUTH_TYPES.ShamanAuthService) private authService: IShamanAuthService,
    @inject(SHAMAN_AUTH_TYPES.UserService) private userService: IUserService,
    @inject(SHAMAN_AUTH_TYPES.TokenService) private tokenService: ITokenService,
  ) { }

  configure = (express: Application): void => {
    let router = Router();
    router
      .post('/authenticate', this.authenticateUser)
      .post('/token', this.getUserPassport)

    express.use('/api/auth', router);
  };

  authenticateUser = (req: Request, res: Response, next: any) => {
    let { email, password } = req.body;
    if (!email) return next(new RouteError('Email not provided.', 400));
    if (!password) return next(new RouteError('Password not provided.', 400));
    this.userService.authenticateUser(email, password)
      .then(user => {
        let authCode = this.authService.createUserAuthCode(user);
        res.json({
          grant_type: 'code',
          authorization_code: authCode,
          temporary: false
        });
      })
      .catch((ex: Error) => next(new RouteError(ex.message, 401)));
  }

  getUserPassport = (req: Request, res: Response, next: any) => {
    let request: TokenRequest = req.body;
    let userPassportFactory: Promise<UserPassport>;
    switch (request.grant_type) {
      case 'code': {
        userPassportFactory = this.getUserPassportFromAuthCode(request.authorization_code);
        break;
      }
      case 'refresh_token': {
        userPassportFactory = this.getUserPassportFromRefreshToken(request.refresh_token);
        break;
      }
      default: return res.status(400).send(`Invalid grant type '${request.grant_type}'.`);
    }
    userPassportFactory
      .then(passport => res.json(passport))
      .catch((ex: Error) => next(new RouteError(ex.message, 401)));
  }

  private getUserPassportFromAuthCode = (authCode: string): Promise<UserPassport> => {
    return this.tokenService.getAccessToken(authCode)
      .then(accessToken => {
        return this.tokenService.getRefreshToken(accessToken)
          .then(refreshToken => ({ accessToken, refreshToken }))
      })
      .then(tokens => this.tokenService
        .getUserPassport(tokens.accessToken, tokens.refreshToken));
  }

  private getUserPassportFromRefreshToken = (token: string): Promise<UserPassport> => {
    return this.tokenService.refreshAccessToken(token)
      .then(accessToken => {
        let refreshToken = this.tokenService.verifyRefreshToken(token);
        return { accessToken, refreshToken };
      })
      .then(tokens => this.tokenService
        .getUserPassport(tokens.accessToken, tokens.refreshToken));
  }

}