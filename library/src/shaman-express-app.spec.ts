import * as chai from 'chai';
import * as sinon from 'sinon';
import * as sinonChai from 'sinon-chai';
import { expect } from 'chai';
import { spy } from 'sinon';
import { ShamanExpressApp } from './shaman-express-app';
import { SHAMAN_API_TYPES } from './composition.types';
import { ShamanExpressRouter as Router } from "./shaman-express-router";
import { Container, injectable } from 'inversify';
import { ShamanExpressController } from './shaman-express-controller';
import { ShamanExpressModule } from './shaman-express-module';
import { Application } from 'express';

describe('ShamanExpressApp', () => {
  chai.use(sinonChai);
  let app: ShamanExpressApp;
  var sandbox: sinon.SinonSandbox;
  
  beforeEach(() => {
    app = new ShamanExpressApp();
    sandbox = sinon.createSandbox();
    sandbox.stub(console, 'log');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('compose', () => {
    it('should generate a container with the correct bindings', (done) => {
      app.compose()
        .then(container => {
          bindFakeController(container);
          expect(container).to.exist;
          expect(container.get(SHAMAN_API_TYPES.AppConfig)).to.exist;
          expect(container.get(SHAMAN_API_TYPES.Logger)).to.exist;
          expect(container.get(SHAMAN_API_TYPES.ApiRouter)).to.exist;
          expect(container.get(SHAMAN_API_TYPES.ExpressApplication)).to.exist;
          done();
        })
        .catch(err => {
          console.log(err);
          throw err;
        });
    });
  });

  describe('configureRouter', () => {
    it('should throw an error if compose has not been called', (done) => {
      const modules = [];
      app.configureRouter(modules)
        .then(_ => { throw new Error("Expected rejected promise, but promise completed.") })
        .catch(err => {
          expect(err.message).to.equal("Please call 'compose' before configuring router.");
          done();
        });
    });

    it('should configure with no modules if none are passed', (done) => {
      let routerConfigureSpy: sinon.SinonSpy;
      app.compose()
        .then(container => {
          bindFakeController(container);
          let router = container.get<Router>(SHAMAN_API_TYPES.ApiRouter);
          routerConfigureSpy = spy(router, 'configure');
          return app.configureRouter();
        })
        .then(_app => {
          expect(routerConfigureSpy.calledOnce).to.be.true;
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    it('should configure the router with the correct modules', (done) => {
      let fakeModule = new FakeModule();
      const modules = [fakeModule];
      let routerConfigureSpy: sinon.SinonSpy;
      app.compose()
        .then(container => {
          bindFakeController(container);
          let router = container.get<Router>(SHAMAN_API_TYPES.ApiRouter);
          routerConfigureSpy = spy(router, 'configure');
          return app.configureRouter(modules);
        })
        .then(_ => {
          expect(routerConfigureSpy.calledOnce).to.be.true;
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    it('should export ShamanExpressModules if module export function exists', (done) => {
      const fakeModule = new FakeModule(true);
      let fakeModuleExportSpy = spy(fakeModule, 'export');
      const modules = [fakeModule];
      let routerConfigureSpy: sinon.SinonSpy;
      app.compose()
        .then(container => {
          bindFakeController(container);
          let router = container.get<Router>(SHAMAN_API_TYPES.ApiRouter);
          routerConfigureSpy = spy(router, 'configure');
          return app.configureRouter(modules);
        })
        .then(_ => {
          expect(fakeModuleExportSpy.calledOnce).to.be.true;
          done();
        })
        .catch(err => {
          done(err);
        });
    });

    it('should configure controllers if controllers exist within modules', (done) => {
      let fakeController = new FakeController();
      const fakeControllerConfigureSpy = spy(fakeController, 'configure');
      const fakeModule = new FakeModule(false, [fakeController]);
      const modules = [fakeModule];
      let routerConfigureSpy: sinon.SinonSpy;
      app.compose()
        .then(container => {
          bindFakeController(container);
          let router = container.get<Router>(SHAMAN_API_TYPES.ApiRouter);
          routerConfigureSpy = spy(router, 'configure');
          return app.configureRouter(modules);
        })
        .then(_ => {
          expect(fakeControllerConfigureSpy.calledOnce).to.be.true;
          done();
        })
        .catch(err => {
          done(err);
        });
    });


    it('should create new parentContainer for module if module.isolated is true', (done) => {
      let fakeController = new FakeController();
      const fakeControllerConfigureSpy = spy(fakeController, 'configure');
      const fakeModule = new FakeModule(false, [fakeController], true);
      const modules = [fakeModule];
      let routerConfigureSpy: sinon.SinonSpy;
      app.compose()
        .then(container => {
          bindFakeController(container);
          let router = container.get<Router>(SHAMAN_API_TYPES.ApiRouter);
          routerConfigureSpy = spy(router, 'configure');
          return app.configureRouter(modules);
        })
        .then(_ => {
          expect(fakeControllerConfigureSpy.calledOnce).to.be.true;
          done();
        })
        .catch(err => {
          done(err);
        });
    });

  });

  describe('startApplication', () => {
    // TODO: Figure out how to test this
  });

});

function bindFakeController(container: Container) {
  container.bind<FakeController>(SHAMAN_API_TYPES.ApiController).to(FakeController)
}


class FakeModule extends ShamanExpressModule {
  name: string = 'FakeModule';
  isolated: boolean = false;
  controllers: (container: Container) => ShamanExpressController[];
  compose = async (container: Container): Promise<Container> => {
    return container;
  }

  constructor(shouldExport = false, controllers = [], isolated = false) {
    super();
    if (shouldExport) {
      this.export = (container) => Promise.resolve();
    }
    this.controllers = (container) => controllers;
    this.isolated = isolated;
  }
}

@injectable()
class FakeController implements ShamanExpressController {
  name: string = 'FakeController';
  configure = (express: Application): Promise<void> => {
    return Promise.resolve();
  }
}
