import { expect } from 'chai';
import * as sinon from 'sinon';
import { ShamanBackupService } from './shaman-backup.service';
import { DatabaseConfig, ShamanBackupConfig } from "../models/shaman-backup.config";
import { IDatabaseService } from "./database-services/backup-service.interface";
import * as _fs from 'fs';

describe('ShamanBackupService', () => {
  let service: ShamanBackupService;
  let mockDatabaseService: sinon.SinonStubbedInstance<IDatabaseService>;
  let mockFs: sinon.SinonStubbedInstance<typeof _fs>;

  beforeEach(() => {
    mockDatabaseService = sinon.stub(new MockDatabaseService());
    mockFs = sinon.stub(_fs);
    service = new ShamanBackupService(
      <ShamanBackupConfig>{ databases: [{ name: 'testDb', type: 'testType' }] },
      [mockDatabaseService]
    );
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return backup path when database exists and backup is successful', async () => {
    mockDatabaseService.getBackup.resolves('testPath');
    mockFs.existsSync.returns(true);

    const result = await service.getBackup('testDb');

    expect(result).to.equal('testPath');
  });

  it('should throw error when database does not exist', async () => {
    try {
      await service.getBackup('nonexistentDb');
    } catch (err) {
      expect(err.message).to.equal("Database 'nonexistentDb' not found.");
    }
  });

  it('should throw error when backup service does not exist', async () => {
    service = new ShamanBackupService(
      <ShamanBackupConfig>{ databases: [{ name: 'testDb', type: 'nonexistentType' }] },
      [mockDatabaseService]
    );

    try {
      await service.getBackup('testDb');
    } catch (err) {
      expect(err.message).to.equal("Backup service 'nonexistentType' not found.");
    }
  });

  it('should throw error when backup file does not exist', async () => {
    mockDatabaseService.getBackup.resolves('testPath');
    mockFs.existsSync.returns(false);

    try {
      await service.getBackup('testDb');
    } catch (err) {
      expect(err.message).to.equal("Backup file 'testPath' not found.");
    }
  });
});

class MockDatabaseService implements IDatabaseService {
  type: string = 'testType';
  getBackup(_dbConfig: DatabaseConfig): Promise<string> {
    return Promise.resolve('testPath');
  }
}