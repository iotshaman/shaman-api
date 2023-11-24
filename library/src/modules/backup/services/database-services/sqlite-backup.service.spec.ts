import * as chai from 'chai';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { SqliteBackupService } from './sqlite.service';


chai.use(sinonChai);

describe('SqliteBackupService', () => {
  let sandbox: sinon.SinonSandbox;
  let sqliteBackupService: SqliteBackupService;

  beforeEach(() => {
    sqliteBackupService = new SqliteBackupService();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getBackup', () => {
    it('should throw an error if config is invalid', (done) => {
      let dbConfig = { type: 'sqlite', name: 'test-name' };
      sqliteBackupService.getBackup(dbConfig)
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal(`Invalid config for sqlite backup service. Filepath is required.`);
          done();
        });
    });

    it('should return the filepath from the dbConfig', (done) => {
      let dbConfig = { type: 'sqlite', name: 'test-name', filepath: 'test-filepath' };
      sqliteBackupService.getBackup(dbConfig)
        .then(backup => {
          expect(backup).to.equal('test-filepath');
          done();
        })
        .catch(err => {
          done(err);
        });
    });

  });
});