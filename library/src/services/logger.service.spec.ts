import { expect } from 'chai';
import 'mocha';
import { LoggerService } from './logger.service';

describe('Logger Service', () => {

  it('Should be created', () => {
    let loggerService = new LoggerService();
    expect(loggerService).not.to.be.null;
  });

  it('logger should be initialized', () => {
    let loggerService = new LoggerService();
    expect(loggerService.logger).not.to.be.null;
  });

});