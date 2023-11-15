import * as chai from 'chai';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import * as _os from 'os';
import * as _cmd from 'child_process';
import { MysqlDumpService } from './mysql-dump.service';
import e = require('express');


chai.use(sinonChai);

describe('MysqlDumpService', () => {
  let sandbox: sinon.SinonSandbox;
  let mysqlDumpService: MysqlDumpService;

  beforeEach(() => {
    mysqlDumpService = new MysqlDumpService();
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getDump', () => {
    it('should throw an error if config is invalid', (done) => {
      let dbConfig = { type: 'mysql', name: 'test-name' };
      mysqlDumpService.getDump(dbConfig)
        .then(() => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal('Invalid config for mysql dump service. Database name, username and password are required.');
          done();
        });
    });

    it('should throw an error is exec returns an error', (done) => {
      let dbConfig = { type: 'mysql', name: 'test-name', username: 'test-username', password: 'test-password' };
      sandbox.stub(_cmd, 'exec').yields({ message: 'error from exec' }, null, null);
      mysqlDumpService.getDump(dbConfig)
        .then(_ => {
          done('Expected an error to be thrown but promise resolved.');
        })
        .catch(err => {
          expect(err.message).to.equal('error from exec');
          done();
        });
    });

    it('should return the filepath for the generated mysql dump', (done) => {
      let dbConfig = { type: 'mysql', name: 'test-name', username: 'test-username', password: 'test-password' };
      sandbox.stub(_cmd, 'exec').yields(null, null, null);
      mysqlDumpService.getDump(dbConfig)
        .then(dump => {
          expect(dump).to.equal(`${_os.tmpdir()}/test-name.sql`);
          done();
        })
        .catch(err => {
          done(err);
        });
    });
  });
});