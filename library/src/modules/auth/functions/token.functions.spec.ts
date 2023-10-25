import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { isTokenExpired } from './token.functions';

chai.use(sinonChai);

describe('isTokenExpired', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return true if the token is expired', () => {
    const tokenExpires = '2021-01-01T00:00:00.000Z';
    sandbox.useFakeTimers(new Date('2022-01-01T00:00:00.000Z'));
    const result = isTokenExpired(tokenExpires);
    expect(result).to.be.true;
  });

  it('should return false if the token is not expired', () => {
    const tokenExpires = '2022-01-01T00:00:00.000Z';
    sandbox.useFakeTimers(new Date('2021-01-01T00:00:00.000Z'));
    const result = isTokenExpired(tokenExpires);
    expect(result).to.be.false;
  });
});