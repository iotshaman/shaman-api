import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { comparePasswordToHash } from './password.functions';
import * as bcrypt from 'bcryptjs';

chai.use(sinonChai);

describe('comparePasswordToHash', () => {
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should return true if the password matches the hash', () => {
    const password = 'password';
    const passwordHash = bcrypt.hashSync(password, 10);
    sandbox.stub(bcrypt, 'compareSync').returns(true);
    const result = comparePasswordToHash(password, passwordHash);
    expect(result).to.be.true;
    expect(bcrypt.compareSync).to.have.been.calledWith(password, passwordHash);
  });

  it('should return false if the password does not match the hash', () => {
    const password = 'password';
    const passwordHash = bcrypt.hashSync('wrongPassword', 10);
    sandbox.stub(bcrypt, 'compareSync').returns(false);
    const result = comparePasswordToHash(password, passwordHash);
    expect(result).to.be.false;
    expect(bcrypt.compareSync).to.have.been.calledWith(password, passwordHash);
  });
});