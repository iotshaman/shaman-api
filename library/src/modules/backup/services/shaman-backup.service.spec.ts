import * as chai from 'chai';
import { expect } from 'chai';
import * as _fs from 'fs';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import { DatabaseConfig, ShamanBackupConfig } from '../exports';
import { IBackupService } from './backup-services/backup-service.interface';
import { ShamanBackupService } from './shaman-backup.service';

chai.use(sinonChai);

describe('ShamanBackupService', () => {
  let sandbox: sinon.SinonSandbox;
  let backupConfig: ShamanBackupConfig;
  let shamanBackupService: ShamanBackupService;

  beforeEach(() => {
    backupConfig = new MockBackupConfig();
    shamanBackupService = new ShamanBackupService(backupConfig);
    shamanBackupService.backupServicesArray = [new MockBackupService()];
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getBackup', () => {
    it('should throw an error if database config not found', (done) => {
      shamanBackupService.getBackup('test-error-name')
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal(`Database 'test-error-name' not found.`);
          done();
        })
    });

    it('should throw an error if backup service not found', (done) => {
      shamanBackupService.backupServicesArray = [];
      shamanBackupService.getBackup('test-name')
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal(`Backup service 'test-db-type' not found.`);
          done();
        });
    });

    it('should throw an error if backup file not found', (done) => {
      sandbox.stub(_fs, 'existsSync').returns(false);
      shamanBackupService.getBackup('test-name')
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal("Backup file 'mock-backup.path' not found.");
          done();
        });
    });

    it('should return a backup file path', (done) => {
      sandbox.stub(_fs, 'existsSync').returns(true);
      shamanBackupService.getBackup('test-name')
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

class MockBackupConfig implements ShamanBackupConfig {
  allowUnsecureConnection: boolean = false;
  databases: DatabaseConfig[] = [
    {
      "type": "test-db-type",
      "name": "test-name"
    }
  ];
}

class MockBackupService implements IBackupService {
  type: string = 'test-db-type';
  getBackup = (_dbConfig: DatabaseConfig): Promise<string> => {
    return Promise.resolve('mock-backup.path');
  };
}