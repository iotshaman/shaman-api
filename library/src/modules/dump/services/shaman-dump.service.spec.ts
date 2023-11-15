import * as chai from 'chai';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { DatabaseConfig, IShamanDumpService, ShamanDumpService } from '../exports';
import { IDumpService } from './dump-services/dump-service.interface';


chai.use(sinonChai);

describe('ShamanDumpService', () => {
  let sandbox: sinon.SinonSandbox;
  let shamanDumpService: ShamanDumpService;

  beforeEach(() => {
    shamanDumpService = new ShamanDumpService();
    shamanDumpService.dumpServiceFactory = [new MockDumpService()];
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getDump', () => {
    it('should throw an error if dump service not found', (done) => {
      let dbConfig: DatabaseConfig = {
        "type": "type-not-found",
        "name": "test-name"
      };
      shamanDumpService.getDump(dbConfig)
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal(`Dump service '${dbConfig.type}' not found.`);
          done();
        });
    });
    
    it('should return a dump file path', (done) => {
      let dbConfig: DatabaseConfig = {
        "type": "test-db-type",
        "name": "test-name"
      };
      shamanDumpService.getDump(dbConfig)
        .then(dump => {
          expect(dump).to.equal('mock-dump');
          done();
        })
        .catch(err => {
          done(err);
        });
    });

  });
});

class MockDumpService implements IDumpService {
  type: string = 'test-db-type';
  getDump = (dbConfig: DatabaseConfig): Promise<string> => {
    return Promise.resolve('mock-dump');
  };
}