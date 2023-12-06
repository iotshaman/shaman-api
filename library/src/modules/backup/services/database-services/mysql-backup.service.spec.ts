import * as chai from 'chai';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as _os from 'os';
import * as _cmd from 'child_process';
import { MysqlBackupService } from './mysql.service';


chai.use(sinonChai);

describe('MysqlBackupService', () => {
  let sandbox: sinon.SinonSandbox;
  let mysqlBackupService: MysqlBackupService;

  beforeEach(() => {
    mysqlBackupService = new MysqlBackupService();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getBackupFilePath', () => {
    it('should throw an error if config is invalid', (done) => {
      let dbConfig = { type: 'mysql', name: 'test-name' };
      mysqlBackupService.getBackupFilePath(dbConfig)
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal('Invalid config for mysql backup service. Database name, username and password are required.');
          done();
        });
    });

    it('should throw an error is exec returns an error', (done) => {
      let dbConfig = { type: 'mysql', name: 'test-name', username: 'test-username', password: 'test-password' };
      sandbox.stub(_cmd, 'exec').yields({ message: 'error from exec' }, null, null);
      mysqlBackupService.getBackupFilePath(dbConfig)
        .then(_ => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal('error from exec');
          done();
        });
    });

    it('should return the filepath for the generated mysql backup', (done) => {
      let dbConfig = { type: 'mysql', name: 'test-name', username: 'test-username', password: 'test-password' };
      sandbox.stub(_cmd, 'exec').yields(null, null, null);
      mysqlBackupService.getBackupFilePath(dbConfig)
        .then(backup => {
          expect(backup).to.equal(`${_os.tmpdir()}/test-name.sql`);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
});