import * as chai from 'chai';
import { expect } from 'chai';
import * as _fs from 'fs';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';

import { Request, Response } from 'express';
import { ShamanBackupConfig } from '../exports';
import { ShamanBackupMiddleware } from './shaman-backup.middleware';

chai.use(sinonChai);

describe('ShamanBackupMiddleware', () => {
  let middleware: ShamanBackupMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: sinon.SinonSpy;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub().returnsThis(),
    };
    nextFunction = sinon.spy();
  });

  describe('verifySecureConnection', () => {
    it('should call next() if allowUnsecureConnection is true', () => {
      const backupConfig: ShamanBackupConfig = { allowUnsecureConnection: true, databases: [] };
      middleware = new ShamanBackupMiddleware(backupConfig);

      middleware.verifySecureConnection(<Request>mockRequest, <Response>mockResponse, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
    });

    it('should call next() if request is secure', () => {
      const backupConfig: ShamanBackupConfig = { allowUnsecureConnection: false, databases: [] };
      middleware = new ShamanBackupMiddleware(backupConfig);
      mockRequest.secure = true;

      middleware.verifySecureConnection(<Request>mockRequest, <Response>mockResponse, nextFunction);

      expect(nextFunction.calledOnce).to.be.true;
    });

    it('should send 403 if request is not secure and allowUnsecureConnection is false', () => {
      const backupConfig = { allowUnsecureConnection: false } as ShamanBackupConfig;
      middleware = new ShamanBackupMiddleware(backupConfig);
      mockRequest.secure = false;

      middleware.verifySecureConnection(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).to.be.calledWith(403);
      expect(mockResponse.send).to.be.calledWith('Insecure connection.');
    });
  });
});