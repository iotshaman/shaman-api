import 'mocha';
import 'sinon-chai'
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import * as express from 'express';
import { Application } from 'express';
import * as cors from 'cors';
import { ExpressFactory } from './express.factory';
import { ShamanExpressAppConfig } from '../shaman-express-app.config';

chai.use(sinonChai);

describe('ExpressFactory', () => {
  describe('GenerateApplication', () => {
    it('should generate an Express application with the default middleware', () => {
      const config: ShamanExpressAppConfig = { disableCors: true };
      const app = ExpressFactory.GenerateApplication(config);
      expect(app._router.stack).to.have.lengthOf(5); // 5 default middleware functions
      expect(app._router.stack[0].handle.name).to.equal('query');
      expect(app._router.stack[1].handle.name).to.equal('expressInit');
      expect(app._router.stack[2].handle.name).to.equal('jsonParser');
      expect(app._router.stack[3].handle.name).to.equal('urlencodedParser');
      expect(app._router.stack[4].handle.name).to.equal('compression');
    });

    it('should generate an Express application with CORS middleware if enabled', () => {
      const config: ShamanExpressAppConfig = { disableCors: false };
      const app = ExpressFactory.GenerateApplication(config);
      expect(app._router.stack).to.have.length(6); // 6 middleware functions with CORS
      expect(app._router.stack[5].handle.name).to.equal('corsMiddleware');
    });

    // TODO: Figure out how to test the CORS middleware headers
    // it('should generate an Express application with custom allowed headers if specified', () => {
    //   const config: ShamanExpressAppConfig = { disableCors: false, headerAllowList: ['Custom-Header'] };
    //   const app = ExpressFactory.GenerateApplication(config);
    //   expect(app._router.stack).to.have.lengthOf(6); // 6 middleware functions with CORS
    //   expect(app._router.stack[5].handle.name).to.equal('corsMiddleware');
    //   expect(app._router.stack[5].handle.options.allowedHeaders).to.include('Custom-Header');
    // });
  });
});