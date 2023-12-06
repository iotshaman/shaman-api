import { Request, Response } from "express";
import { injectable } from "inversify";
import { RouteError } from "../../models/router-error";
import { AuthStatusCode } from "./models/auth/auth-status-code";
import { IShamanAuthService } from "./services/shaman-auth.service";

/* istanbul ignore next */
@injectable()
export class AuthorizeControllerBase {

  constructor(private authService: IShamanAuthService, private permissions: string[] = []) { }

  protected authorize = (req: Request, _res: Response, next: any): void => {
    let tokenData = this.authService.getTokenData(req.get('Authorization'));
    if (tokenData == null || tokenData.tokenType != "Bearer")
      return this.notAuthorized("Invalid token.", next);

    let authCode = this.authService.authorize(tokenData.tokenValue, this.permissions);
    switch (+authCode) {
      case AuthStatusCode.Authorized:
        return next();
      case AuthStatusCode.InvalidToken:
        return this.notAuthorized("Invalid token.", next, 400);
      case AuthStatusCode.PermissionDenied:
        return this.notAuthorized("Permission denied.", next, 403);
      case AuthStatusCode.TokenExpired:
        return this.notAuthorized("Token expired.", next);
    }
  }

  protected getEmailFromToken = (req: Request): string => {
    return this.authService.getEmailFromToken(req.get("Authorization"));
  }

  private notAuthorized = (msg: string, next: any, statusCode: number = 401) => {
    next(new RouteError(msg, statusCode))
  }

}