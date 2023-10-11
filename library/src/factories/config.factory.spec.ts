import 'mocha';
import 'sinon-chai'
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { ConfigFactory } from './config.factory';
import { JsonFileService } from '../services/json.service';

describe('ConfigFactory', () => {

  chai.use(sinonChai);
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  })

  afterEach(() => {
    sandbox.restore();
  });

  describe('GenerateConfig', () => {
    it('should return an empty object if no config path is provided', (done) => {
      const configPath = '';
      sandbox.stub(JsonFileService.prototype, 'getJson').returns(Promise.resolve({}));
      ConfigFactory.GenerateConfig(configPath)
        .then((config) => {
          expect(config).to.eql({});
          done();
        });
    });

    it('should return the JSON data of the specified config file', (done) => {
      const configPath = 'example.json';
      const expectedConfig = { id: 1, name: 'Example' };
      sandbox.stub(JsonFileService.prototype, 'getJson').returns(Promise.resolve(expectedConfig));
      ConfigFactory.GenerateConfig(configPath)
        .then((config) => {
          expect(config).to.eql(expectedConfig);
          done();
        });
    });
  });
});