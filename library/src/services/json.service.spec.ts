import 'mocha';
import { expect } from 'chai';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { JsonFileService } from './json.service';
import * as fs from 'fs';

describe('JsonFileService', () => {

  chai.use(sinonChai);
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  describe('getJson', () => {
    it('should read a JSON file and return its contents', (done) => {
      const path = 'test.json';
      const data = { name: 'John Doe', age: 30 };
      const readFileStub = sandbox.stub(fs, 'readFile').callsArgWith(2, null, JSON.stringify(data));
      let subject = new JsonFileService();
      subject.getJson(path)
        .then(result => {
          expect(readFileStub).to.have.been.calledWith(path, 'utf-8');
          expect(result).to.deep.equal(data);
          done();
        });
    });

    it('should reject with an error if the file cannot be read', (done) => {
      const path = 'test.json';
      const error = new Error('File not found');
      const readFileStub = sandbox.stub(fs, 'readFile').callsArgWith(2, error);
      let subject = new JsonFileService();
      subject.getJson(path)
        .then(_ => { done(new Error("Expected rejected promise, but promise completed.")) })
        .catch(err => {
          expect(readFileStub).to.have.been.calledWith(path, 'utf-8');
          expect(err).to.equal(error);
          done();
        });
    });
  });

  describe('writeJson', () => {
    it('should write a JSON file with the given data', (done) => {
      const path = 'test.json';
      const data = { name: 'John Doe', age: 30 };
      const writeFileStub = sandbox.stub(fs, 'writeFile').callsArgWith(2, null);
      let subject = new JsonFileService();
      subject.writeJson(path, data)
        .then(_ => {
          expect(writeFileStub).to.have.been.calledWith(path, JSON.stringify(data, null, 2));
          done();
        });
    });

    it('should reject with an error if the file cannot be written', (done) => {
      const path = 'test.json';
      const data = { name: 'John Doe', age: 30 };
      const error = new Error('File not found');
      const writeFileStub = sandbox.stub(fs, 'writeFile').callsArgWith(2, error);
      let subject = new JsonFileService();
      subject.writeJson(path, data)
        .then(_ => { done(new Error("Expected rejected promise, but promise completed.")) })
        .catch(err => {
          expect(writeFileStub).to.have.been.calledWith(path, JSON.stringify(data, null, 2));
          expect(err).to.equal(error);
          done();
        });
    });
  });
});