import 'mocha';
import * as fs from 'fs';
import * as sinon from "sinon";
import { expect } from 'chai';
import { JsonFileService } from './json-file.service';

describe('Logger', () => {

  var sandbox = sinon.createSandbox();

  afterEach(() => {
    sandbox.restore();
  });

  it('getJson should return object', (done) => {
    var subject = new JsonFileService();
    sandbox.stub(fs, 'readFile').yields(null, "{}");
    subject.getJson('').then(json => {
      expect(json).not.to.be.null;
      done();
    });
  });

  it('getJson throw if file system throws', (done) => {
    var subject = new JsonFileService();
    sandbox.stub(fs, 'readFile').yields(new Error("test error"));
    subject.getJson('').catch(_ => done());
  });

  it('getJson should return empty promise', (done) => {
    var subject = new JsonFileService();
    sandbox.stub(fs, 'writeFile').yields(null);
    subject.writeJson('', {}).then(_ => done());
  });

  it('getJson throw if file system throws', (done) => {
    var subject = new JsonFileService();
    sandbox.stub(fs, 'writeFile').yields(new Error("test error"));
    subject.writeJson('', {}).catch(_ => done());
  });

});