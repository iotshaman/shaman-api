import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { RouteError } from "../../models/router-error";
import { ShamanExpressController } from "../../shaman-express-controller";
import { TokenRequest } from "./models/auth/token-request";
import { UserPassport } from "./models/auth/user-passport";
import { ShamanAuthService } from "./services/shaman-auth.service";
import { TokenService } from "./services/token.service";
import { UserService } from "./services/user.service";
import { SHAMAN_AUTH_TYPES } from "./shaman-auth.types";

@injectable()
export class ShamanAuthController implements ShamanExpressController {
  name: string = 'shaman-auth';

  @inject(SHAMAN_AUTH_TYPES.ShamanAuthService)
  private authService: ShamanAuthService;
  @inject(SHAMAN_AUTH_TYPES.UserService)
  private userService: UserService;
  @inject(SHAMAN_AUTH_TYPES.TokenService)
  private tokenService: TokenService;

  configure = (express: Application): void => {
    let router = Router();
    router
      .post('/authenticate', this.authenticateUser)
      .post('/token', this.getUserPassport)

    express.use('/api/auth', router);
  };

  authenticateUser = (req: Request, res: Response, next: any) => {
    let { email, password } = req.body;
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
    let userPassportfactory: Promise<UserPassport>;
    switch (request.grant_type) {
      case 'code': {
        userPassportfactory = this.getUserPassportFromAuthCode(request.authorization_code);
        break;
      }
      case 'refresh_token': {
        userPassportfactory = this.getUserPassportFromRefreshToken(request.refresh_token);
        break;
      }
      default: return res.status(400).send(`Invalid grant type '${request.grant_type}'.`);
    }
    userPassportfactory
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