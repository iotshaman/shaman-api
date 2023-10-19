import { injectable } from 'inversify';
import { sign, verify } from 'jsonwebtoken';
import { isTokenExpired } from '../functions/token.functions';
import { AccessToken } from '../models/auth/access-token';
import { AuthCode } from '../models/auth/auth-code.model';
import { AuthStatusCode } from '../models/auth/auth-status-code';
import { TokenData } from '../models/auth/token-data';
import { User } from '../models/user.model';

export interface IShamanAuthService {
  createUserAuthCode: (user: User) => string;
  getTokenData: (token: string) => TokenData;
  authorize: (accessToken: string, permissions: string[], connector?: string) => AuthStatusCode;
  getEmailFromToken: (token: string) => string;
}

@injectable()
export class ShamanAuthService {
  constructor(private tokenSecret: string) { }

  createUserAuthCode = (user: User): string => {
    let date = new Date();
    let authCode: AuthCode = {
      emailAddress: user.emailAddress,
      expires: new Date(date.setMinutes(date.getMinutes() + 5)).toString()
    };
    return sign(authCode, this.tokenSecret);
  }

  getTokenData = (token: string): TokenData => {
    if (token == null || token.match(/^(\S+)\s(.*)/) == null) return null;
    let tokenParts = token.match(/^(\S+)\s(.*)/).slice(1);
    return new TokenData(tokenParts[0], tokenParts[1]);
  }

  authorize = (accessToken: string, permissions: string[], connector: string = "AND"): AuthStatusCode => {
    let token = this.getAccessToken(accessToken);
    if (token == null) return AuthStatusCode.InvalidToken;
    let hasPermissions = this.hasPermissions(token, permissions, connector);
    if (!hasPermissions) return AuthStatusCode.PermissionDenied;
    let expired = isTokenExpired(token.expires);
    return expired ? AuthStatusCode.TokenExpired : AuthStatusCode.Authorized;
  }

  getEmailFromToken = (token: string): string => {
    let tokenData = this.getTokenData(token);
    if (tokenData == null || tokenData.tokenType != "Bearer") return null;
    let accessToken = this.getAccessToken(tokenData.tokenValue);
    return accessToken?.emailAddress;
  }

  private getAccessToken = (accessToken: string): AccessToken => {
    try {
      let token: any = verify(accessToken, this.tokenSecret);
      return {
        emailAddress: token.emailAddress,
        permissions: token.permissions,
        expires: token.expires
      }
    } catch (_ex) {
      return null;
    }
  }

  private hasPermissions(accessToken: AccessToken, permissions: string[], connector: string) {
    return connector == "AND" ?
      permissions.every(p => accessToken.permissions.indexOf(p) > -1) :
      permissions.some(p => accessToken.permissions.indexOf(p) > -1);
  }

}