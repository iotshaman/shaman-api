import { expect } from 'chai';
import 'mocha';
import { TokenService } from './token.service';

describe('Token Service', () => {

  it('Should be created', () => {
    let tokenService = new TokenService({});
    expect(tokenService).not.to.be.null;
  });

  it('GetToken should return token', () => {
    let tokenService = new TokenService({foo: 'bar'});
    let rslt = tokenService.GetToken('foo');
    expect(rslt).to.equal('bar');
  });

});