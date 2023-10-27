import { injectable } from 'inversify';
import { sign, verify } from 'jsonwebtoken';
import * as moment from 'moment';
import { isTokenExpired } from "../functions/token.functions";
import { AccessToken } from "../models/auth/access-token";
import { AuthCode } from '../models/auth/auth-code.model';
import { RefreshToken } from '../models/auth/refresh-token';
import { UserPassport } from "../models/auth/user-passport";
import { IUserService } from './user.service';

export interface ITokenService {
  getAccessToken: (authCodeToken: string) => Promise<AccessToken>;
  getRefreshToken: (accessToken: AccessToken) => Promise<RefreshToken>;
  verifyRefreshToken: (refreshToken: string) => RefreshToken;
  refreshAccessToken: (refreshToken: string) => Promise<AccessToken>;
  getUserPassport: (accessToken: AccessToken, refreshToken: RefreshToken) => UserPassport;
}

@injectable()
export class TokenService implements ITokenService {

  constructor(public tokenSecret: string, private userService: IUserService) {
    if (!tokenSecret)
      throw new Error("Token secret is required. See https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/auth");
  }

  getAccessToken = (authCodeToken: string): Promise<AccessToken> => {
    return this.validateAuthCode(authCodeToken)
      .then(authCode => this.userService.getUserWithPermissions(authCode.emailAddress))
      .then(userWithPermissions => ({
        emailAddress: userWithPermissions.user.emailAddress,
        permissions: userWithPermissions.permissions,
        expires: moment().add(12, 'hours').toDate().toISOString()
      }));
  }

  getRefreshToken = (accessToken: AccessToken): Promise<RefreshToken> => {
    return Promise.resolve({
      emailAddress: accessToken.emailAddress,
      expires: moment().add(5, 'days').toDate().toISOString()
    });
  }

  getUserPassport = (accessToken: AccessToken, refreshToken: RefreshToken): UserPassport => {
    return {
      emailAddress: accessToken.emailAddress,
      accessToken: sign(accessToken, this.tokenSecret),
      refreshToken: sign(refreshToken, this.tokenSecret),
      accessTokenExpires: accessToken.expires,
      refreshTokenExpires: refreshToken.expires
    };
  }

  verifyRefreshToken = (refreshToken: string): RefreshToken => {
    return <RefreshToken>verify(refreshToken, this.tokenSecret);
  }

  refreshAccessToken = (refreshToken: string): Promise<AccessToken> => {
    return this.validateRefreshToken(refreshToken)
      .then(token => this.userService.getUserWithPermissions(token.emailAddress))
      .then(userWithPermissions => ({
        emailAddress: userWithPermissions.user.emailAddress,
        permissions: userWithPermissions.permissions,
        expires: moment().add(12, 'hours').toDate().toISOString()
      }));
  }

  /* istanbul ignore next */
  private validateAuthCode = (authCode: string): Promise<AuthCode> => {
    return new Promise((res, err) => {
      let val: AuthCode = <AuthCode>verify(authCode, this.tokenSecret);
      let expired = isTokenExpired(val.expires);
      expired ? err(new Error("Auth code has expired")) : res(val);
    });
  }

  /* istanbul ignore next */
  private validateRefreshToken = (refreshToken: string): Promise<RefreshToken> => {
    return new Promise((res, err) => {
      let val: RefreshToken = <RefreshToken>verify(refreshToken, this.tokenSecret);
      let expired = isTokenExpired(val.expires);
      expired ? err(new Error("Refresh has expired")) : res(val);
    });
  }

}