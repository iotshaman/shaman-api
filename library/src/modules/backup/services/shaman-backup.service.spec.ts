import * as chai from 'chai';
import { expect } from 'chai';
import * as _fs from 'fs';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import { DatabaseConfig } from '../exports';
import { IBackupService } from './backup-services/backup-service.interface';
import { ShamanBackupService } from './shaman-backup.service';


chai.use(sinonChai);

describe('ShamanBackupService', () => {
  let sandbox: sinon.SinonSandbox;
  let shamanBackupService: ShamanBackupService;

  beforeEach(() => {
    shamanBackupService = new ShamanBackupService();
    shamanBackupService.backupServicesArray = [new MockBackupService()];
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getBackup', () => {
    it('should throw an error if backup service not found', (done) => {
      let dbConfig: DatabaseConfig = {
        "type": "type-not-found",
        "name": "test-name"
      };
      shamanBackupService.getBackup(dbConfig)
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal(`Backup service '${dbConfig.type}' not found.`);
          done();
        });
    });

    it('should throw an error if backup file not found', (done) => {
      let dbConfig: DatabaseConfig = {
        "type": "test-db-type",
        "name": "test-name"
      };
      sandbox.stub(_fs, 'existsSync').returns(false);
      shamanBackupService.getBackup(dbConfig)
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal("Backup file 'mock-backup.path' not found.");
          done();
        });
    });

    it('should return a backup file path', (done) => {
      let dbConfig: DatabaseConfig = {
        "type": "test-db-type",
        "name": "test-name"
      };
      sandbox.stub(_fs, 'existsSync').returns(true);
      shamanBackupService.getBackup(dbConfig)
        .then(backup => {
          expect(backup).to.equal('mock-backup.path');
          done();
        })
        .catch(err => {
          done(err);
        });
    });

  });
});

class MockBackupService implements IBackupService {
  type: string = 'test-db-type';
  getBackup = (dbConfig: DatabaseConfig): Promise<string> => {
    return Promise.resolve('mock-backup.path');
  };
}