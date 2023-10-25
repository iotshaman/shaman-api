import * as chai from 'chai';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as _passwordFunctions from '../functions/password.functions';
import { IUserDao } from '../models/user.dao';
import { User } from '../models/user.model';
import { IUserService, UserService } from './user.service';

chai.use(sinonChai);

describe('UserService', () => {
  let userService: IUserService;
  let userDao: IUserDao;
  let sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    userDao = new MockUserDoa();
    userService = new UserService(userDao);
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getUserWithPermissions', () => {
    it('should return a UserPermissionMap with the user and permissions', async () => {
      const email = 'test@example.com';
      const user: User = { emailAddress: email, passwordHash: 'hash' };
      const permissions = ['read'];
      sandbox.stub(userDao, 'getUserByEmail').resolves(user);
      sandbox.stub(userDao, 'getUserPermissions').resolves(permissions);
      const result = await userService.getUserWithPermissions(email);
      expect(result).to.deep.equal({ user, permissions });
      expect(userDao.getUserByEmail).to.have.been.calledWith(email);
      expect(userDao.getUserPermissions).to.have.been.calledWith(email);
    });
  });

  describe('authenticateUser', () => {
    it('should return the user if the password is valid', async () => {
      const email = 'test@example.com';
      const password = 'password';
      const user: User = { emailAddress: email, passwordHash: 'hash' };
      sandbox.stub(userDao, 'getUserByEmail').resolves(user);
      sandbox.stub(_passwordFunctions, 'comparePasswordToHash').returns(true);

      // Act
      const result = await userService.authenticateUser(email, password);

      // Assert
      expect(result).to.deep.equal(user);
      expect(userDao.getUserByEmail).to.have.been.calledWith(email);
      expect(_passwordFunctions.comparePasswordToHash).to.have.been.calledWith(password, user.passwordHash);
    });

    it('should throw an error if the password is invalid', (done) => {
      const email = 'test@example.com';
      const password = 'password';
      const user: User = { emailAddress: email, passwordHash: 'hash' };
      sandbox.stub(userDao, 'getUserByEmail').resolves(user);
      sandbox.stub(_passwordFunctions, 'comparePasswordToHash').returns(false);
      userService.authenticateUser(email, password)
        .then(() => done('Expected an error to be thrown but promise resolved.'))
        .catch(err => {
          expect(err.message).to.equal('Password is invalid.');
          expect(userDao.getUserByEmail).to.have.been.calledWith(email);
          expect(_passwordFunctions.comparePasswordToHash).to.have.been.calledWith(password, user.passwordHash);
          done();
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