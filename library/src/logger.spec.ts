import 'mocha';
import 'sinon-chai'
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { stub, SinonStub } from 'sinon';
import { Logger } from './logger';

describe('Logger', () => {

  chai.use(sinonChai);
  let logger: Logger;
  var sandbox: sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
    logger = new Logger();
  })

  afterEach(() => {
    sandbox.restore();
  });

  describe('constructor', () => {
    it('should create a new logger with the default configuration', () => {
      expect(logger.logger).to.exist;
      expect(logger.logger.transports).to.have.lengthOf(1);
      expect(logger.logger.format).to.exist;
    });
  });

  describe('write', () => {
    let logStub: SinonStub;

    beforeEach(() => {
      logStub = stub(logger.logger, 'log');
    });

    afterEach(() => {
      logStub.restore();
    });

    it('should log a message with the default level if none is specified', () => {
      const message = 'Test message';
      logger.write(message);
      expect(logStub.calledWith(sinon.match({ level: 'info', message: message })));
    });

    it('should log a message with the specified level', () => {
      const message = 'Test message';
      const level = 'warn';
      logger.write(message, level);
      expect(logStub.calledWith(sinon.match({ level: level, message: message })));
    });
  });
});