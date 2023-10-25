import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { ShamanAuthService, IShamanAuthService } from './shaman-auth.service';
import { AuthStatusCode } from '../models/auth/auth-status-code';
import { User } from '../models/user.model';
import { TokenData } from '../models/auth/token-data';
import * as _tokenFunctions from '../functions/token.functions';
import { AuthCode } from '../models/auth/auth-code.model';
import * as _jwt from 'jsonwebtoken';
import { AccessToken } from '../models/auth/access-token';

chai.use(sinonChai);

describe('ShamanAuthService', () => {
  let authService: IShamanAuthService;
  let sandbox: sinon.SinonSandbox;
  const tokenSecret = 'secret';

  beforeEach(() => {
    authService = new ShamanAuthService(tokenSecret);
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createUserAuthCode', () => {
    it('should create an auth code with the user email address and expiration date', () => {
      const user: User = {
        emailAddress: 'test@example.com',
        passwordHash: 'fakeHash'
      };
      const fakeToken = 'fakeToken';
      const fakeDate = new Date('2022-01-01T00:00:00.000Z');
      sandbox.useFakeTimers(fakeDate);
      sandbox.stub(_jwt, <any>'sign').returns(fakeToken);
      const result = authService.createUserAuthCode(user);
      expect(result).to.equal(fakeToken);
      expect(_jwt.sign).to.have.been.calledWith(
        { emailAddress: user.emailAddress, expires: new Date(fakeDate.setMinutes(fakeDate.getMinutes() + 5)).toString() },
        tokenSecret
      );
    });
  });

  describe('getTokenData', () => {
    it('should return null if the token is null or does not match the expected format', () => {
      const tokens = [null, '', 'invalidToken'];
      const results = tokens.map(token => authService.getTokenData(token));
      results.forEach(result => expect(result).to.be.null);
    });

    it('should return a TokenData object if the token matches the expected format', () => {
      const token = 'Bearer fakeToken';
      const result = authService.getTokenData(token);
      expect(result).to.deep.equal(new TokenData('Bearer', 'fakeToken'));
    });
  });

  describe('authorize', () => {
    it('should return InvalidToken if the token is null', () => {
      const accessToken = null;
      const permissions = [];
      const result = authService.authorize(accessToken, permissions);
      expect(result).to.equal(AuthStatusCode.InvalidToken);
    });

    it('should return PermissionDenied if the token does not have the required permissions', () => {
      const accessToken = 'Bearer fakeToken';
      const permissions = ['user'];
      sandbox.stub(authService, <any>'getAccessToken').returns({ permissions: ['admin'] });
      const result = authService.authorize(accessToken, permissions);
      expect(result).to.equal(AuthStatusCode.PermissionDenied);
    });

    it('should return TokenExpired if the token is expired', () => {
      const accessToken = 'Bearer fakeToken';
      const permissions = [];
      sandbox.stub(authService, <any>'getAccessToken').returns({ expires: '2021-01-01T00:00:00.000Z' });
      sandbox.stub(_tokenFunctions, <any>'isTokenExpired').returns(true);
      const result = authService.authorize(accessToken, permissions);
      expect(result).to.equal(AuthStatusCode.TokenExpired);
    });

    it('should return Authorized if the token is valid and has the required permissions', () => {
      const accessToken = 'Bearer fakeToken';
      const permissions = ['admin'];
      sandbox.stub(authService, <any>'getAccessToken').returns({ permissions });
      sandbox.stub(_tokenFunctions, <any>'isTokenExpired').returns(false);
      const result = authService.authorize(accessToken, permissions);
      expect(result).to.equal(AuthStatusCode.Authorized);
    });

    it('should return Authorized if the token is valid and has some of the required permissions', () => {
      const accessToken = 'Bearer fakeToken';
      const permissions = ['admin', 'user'];
      sandbox.stub(authService, <any>'getAccessToken').returns({ permissions: ['admin'] });
      sandbox.stub(_tokenFunctions, <any>'isTokenExpired').returns(false);
      const result = authService.authorize(accessToken, permissions, 'OR');
      expect(result).to.equal(AuthStatusCode.Authorized);
    });
  });

  describe('getEmailFromToken', () => {
    it('should return the email address from the token', () => {
      const token = 'Bearer fakeToken';
      const fakeAccessToken: AccessToken = { emailAddress: 'test@example.com', expires: '2022-01-01T00:00:00.000Z', permissions: [] };
      sandbox.stub(authService, <any>'getAccessToken').returns(fakeAccessToken);
      const result = authService.getEmailFromToken(token);
      expect(result).to.equal(fakeAccessToken.emailAddress);
    });

    it('should return undefined is email not present in access token', () => {
      const token = 'Bearer fakeToken';
      const fakeAccessToken = { expires: '2022-01-01T00:00:00.000Z', permissions: [] };
      sandbox.stub(authService, <any>'getAccessToken').returns(fakeAccessToken);
      const result = authService.getEmailFromToken(token);
      expect(result).to.equal(undefined);
    });

    it('should return null if getTokenData returns null', () => {
      const token = '';
      sandbox.stub(authService, <any>'getTokenData').returns(null);
      const result = authService.getEmailFromToken(token);
      expect(result).to.equal(null);
    });
  });
});