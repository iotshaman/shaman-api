import * as chai from 'chai';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { SqliteDumpService } from './sqlite-dump.service';


chai.use(sinonChai);

describe('SqliteDumpService', () => {
  let sandbox: sinon.SinonSandbox;
  let sqliteDumpService: SqliteDumpService;

  beforeEach(() => {
    sqliteDumpService = new SqliteDumpService();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getDump', () => {
    it('should throw an error if config is invalid', (done) => {
      let dbConfig = { type: 'sqlite', name: 'test-name' };
      sqliteDumpService.getDump(dbConfig)
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal(`Invalid config for sqlite dump service. Filepath is required.`);
          done();
        });
    });

    it('should return the filepath from the dbConfig', (done) => {
      let dbConfig = { type: 'sqlite', name: 'test-name', filepath: 'test-filepath' };
      sqliteDumpService.getDump(dbConfig)
        .then(dump => {
          expect(dump).to.equal('test-filepath');
          done();
        })
        .catch(err => {
          done(err);
        });
    });

  });
});