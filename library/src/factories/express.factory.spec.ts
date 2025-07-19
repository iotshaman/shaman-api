import 'mocha';
import 'sinon-chai'
import * as chai from 'chai';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { ExpressFactory } from './express.factory';
import { ShamanExpressAppConfig } from '../shaman-express-app.config';

chai.use(sinonChai);

describe('ExpressFactory', () => {
  describe('GenerateApplication', () => {
    it('should generate an Express application with the default middleware', () => {
      const config: ShamanExpressAppConfig = { disableCors: true };
      const app = ExpressFactory.GenerateApplication(config);
      expect(app.router.stack).to.have.lengthOf(3); // 5 default middleware functions
      expect(app.router.stack[0].handle.name).to.equal('jsonParser');
      expect(app.router.stack[1].handle.name).to.equal('urlencodedParser');
      expect(app.router.stack[2].handle.name).to.equal('compression');
    });

    it('should generate an Express application with CORS middleware if enabled', () => {
      const config: ShamanExpressAppConfig = { disableCors: false };
      const app = ExpressFactory.GenerateApplication(config);
      expect(app.router.stack).to.have.length(4); // 6 middleware functions with CORS
      expect(app.router.stack[3].handle.name).to.equal('corsMiddleware');
    });

    it('should generate an Express application with body parser config', () => {
      const config: ShamanExpressAppConfig = { bodyParser: {limit: "10mb"} };
      const app = ExpressFactory.GenerateApplication(config);
      expect(app.router.stack).to.have.lengthOf(4);
    });

    it('should generate an Express application even with incomplete body parser config', () => {
      const config: ShamanExpressAppConfig = { bodyParser: {limit:null} };
      const app = ExpressFactory.GenerateApplication(config);
      expect(app.router.stack).to.have.lengthOf(4);
    });
  });
});