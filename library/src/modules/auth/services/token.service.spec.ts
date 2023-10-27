import * as chai from 'chai';
import { assert, expect } from 'chai';
import * as _jwt from 'jsonwebtoken';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { IUserDao } from '../exports';
import { AccessToken } from '../models/auth/access-token';
import { RefreshToken } from '../models/auth/refresh-token';
import { UserPermissionMap } from '../models/auth/user-permission-map.model';
import { User } from '../models/user.model';
import { ITokenService, TokenService } from './token.service';
import { IUserService, UserService } from './user.service';

chai.use(sinonChai);

describe('TokenService', () => {
  let tokenService: ITokenService;
  let userService: IUserService;
  let sandbox: sinon.SinonSandbox;
  const tokenSecret = 'secret';

  beforeEach(() => {
    userService = new UserService(new MockUserDoa());
    tokenService = new TokenService(tokenSecret, userService);
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => { 
    it('should throw an error if the token secret is not provided', () => {
      expect(() => new TokenService(null, userService)).to.throw('Token secret is required');
    });
  });

  describe('getAccessToken', () => {
    it('should return an access token with the user email address, permissions, and expiration date', async () => {
      const authCodeToken = 'fakeToken';
      const authCode = { emailAddress: 'test@example.com' };
      const userWithPermissions: UserPermissionMap = {
        user: { emailAddress: authCode.emailAddress, passwordHash: 'fakeHash' },
        permissions: ['read']
      };
      sandbox.stub(tokenService, <any>'validateAuthCode').resolves(authCode);
      sandbox.stub(userService, <any>'getUserWithPermissions').resolves(userWithPermissions);
      sandbox.stub(Date.prototype, 'toISOString').returns('2022-01-01T00:00:00.000Z');
      let result = await tokenService.getAccessToken(authCodeToken)
      assert.deepEqual(result, {
        emailAddress: userWithPermissions.user.emailAddress,
        permissions: userWithPermissions.permissions,
        expires: '2022-01-01T00:00:00.000Z'
      });
    });
  });

  describe('getRefreshToken', () => {
    it('should return a refresh token with the user email address and expiration date', async () => {
      const accessToken: AccessToken = { emailAddress: 'test@example.com', permissions: ['read'], expires: '2022-01-01T00:00:00.000Z' };
      sandbox.stub(Date.prototype, 'toISOString').returns('2022-01-01T00:00:00.000Z');
      const result = await tokenService.getRefreshToken(accessToken);
      assert.deepEqual(result, {
        emailAddress: accessToken.emailAddress,
        expires: '2022-01-01T00:00:00.000Z'
      });
    });
  });

  describe('getUserPassport', () => {
    it('should return a user passport with the user email address, access token, refresh token, and expiration dates', () => {
      const accessToken: AccessToken = { emailAddress: 'test@example.com', permissions: ['read'], expires: '2022-01-01T00:00:00.000Z' };
      const refreshToken: RefreshToken = { emailAddress: 'test@example.com', expires: '2022-01-06T00:00:00.000Z' };
      sandbox.stub(_jwt, <any>'sign').returns('fakeToken');
      const result = tokenService.getUserPassport(accessToken, refreshToken);
      assert.deepEqual(result, {
        emailAddress: accessToken.emailAddress,
        accessToken: 'fakeToken',
        refreshToken: 'fakeToken',
        accessTokenExpires: accessToken.expires,
        refreshTokenExpires: refreshToken.expires
      });
      expect(_jwt.sign).to.have.been.calledTwice;
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return the decoded refresh token', () => {
      const refreshToken = 'fakeToken';
      const decodedToken = { emailAddress: 'test@example.com', expires: '2022-01-06T00:00:00.000Z' };
      sandbox.stub(_jwt, <any>'verify').returns(decodedToken);
      const result = tokenService.verifyRefreshToken(refreshToken);
      assert.deepEqual(result, decodedToken);
      expect(_jwt.verify).to.have.been.calledWith(refreshToken, tokenSecret);
    });
  });

  describe('refreshAccessToken', () => {
    it('shasdfasdf', async () => {
      const userWithPermissions: UserPermissionMap = {
        user: { emailAddress: 'test@example.com', passwordHash: 'fakeHash' },
        permissions: ['read']
      };
      sandbox.stub(userService, <any>'getUserWithPermissions').resolves(userWithPermissions);
      sandbox.stub(tokenService, <any>'validateRefreshToken').resolves({ emailAddress: 'test@example.com' });
      sandbox.stub(Date.prototype, 'toISOString').returns('2022-01-01T00:00:00.000Z');
      const result = await tokenService.refreshAccessToken('fakeToken');
      assert.deepEqual(result, {
        emailAddress: userWithPermissions.user.emailAddress,
        permissions: userWithPermissions.permissions,
        expires: '2022-01-01T00:00:00.000Z'
      });
    });
  });

});

class MockUserDoa implements IUserDao {
  getUserByEmail(email: string): Promise<User> {
    throw new Error("Method not implemented.");
  }
  getUserPermissions(email: string): Promise<string[]> {
    throw new Error("Method not implemented.");
  }
}