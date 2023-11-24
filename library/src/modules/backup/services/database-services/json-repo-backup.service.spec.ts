import * as chai from 'chai';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { JsonRepoBackupService } from './json-repo.service';


chai.use(sinonChai);

describe('JsonRepoBackupService', () => {
  let sandbox: sinon.SinonSandbox;
  let jsonRepoBackupService: JsonRepoBackupService;

  beforeEach(() => {
    jsonRepoBackupService = new JsonRepoBackupService();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getBackup', () => {
    it('should throw an error if config is invalid', (done) => {
      let dbConfig = { type: 'json-repo', name: 'test-name' };
      jsonRepoBackupService.getBackup(dbConfig)
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal(`Invalid config for json-repo backup service. Filepath is required.`);
          done();
        });
    });

    it('should return the filepath from the dbConfig', (done) => {
      let dbConfig = { type: 'json-repo', name: 'test-name', filepath: 'test-filepath' };
      jsonRepoBackupService.getBackup(dbConfig)
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