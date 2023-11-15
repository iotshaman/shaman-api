import * as chai from 'chai';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { JsonRepoDumpService } from './json-repo-dump.service';


chai.use(sinonChai);

describe('JsonRepoDumpService', () => {
  let sandbox: sinon.SinonSandbox;
  let jsonRepoDumpService: JsonRepoDumpService;

  beforeEach(() => {
    jsonRepoDumpService = new JsonRepoDumpService();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getDump', () => {
    it('should throw an error if config is invalid', (done) => {
      let dbConfig = { type: 'json-repo', name: 'test-name' };
      jsonRepoDumpService.getDump(dbConfig)
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal(`Invalid config for json-repo dump service. Filepath is required.`);
          done();
        });
    });

    it('should return the filepath from the dbConfig', (done) => {
      let dbConfig = { type: 'json-repo', name: 'test-name', filepath: 'test-filepath' };
      jsonRepoDumpService.getDump(dbConfig)
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