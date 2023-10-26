# Shaman API
Shaman API makes it super easy to create a RESTful API, using Typescript. The server is built on top of ExpressJS, and leverages InversifyJS to handle dependency injection. It comes pre-built with app configuration, an HTTP request router, a service for reading / writing JSON files, a service-client abstract class for HTTP proxy requests, and a module loader (see below). 

## Requirements
To safely use the shaman-api library, you should first have the following tools installed on your machine:

- Node JS (>= 17.x)

Since this project also assumes you will be using Typescript, you will also need to have Typescript (>= 5.x) either installed on your machine, or in your local project (recommended).

## Quick Start Guide
In your typescript project, make 2 new files: main.ts, and health.controller.ts. Open the health.controller.ts file and paste in the following contents:

```ts
import { Request, Response, Application, Router } from "express";
import { injectable } from "inversify";
import { ShamanExpressController } from "shaman-api";

// controller must have injectable attribute
@injectable()
export class HealthController implements ShamanExpressController {

  name: string = 'health';

  configure(express: Application) {
    let router = Router();
    router.get('/', this.getStatus);
    express.use('/api/health', router);
  }

  getStatus(_req: Request, res: Response, _next: any) {
    res.json({status: 'healthy'});
  }

}
```

Next, open the main.ts file and paste the following contents:

```ts
import "reflect-metadata";
import { SHAMAN_API_TYPES, ShamanExpressApp, ShamanExpressController } from 'shaman-api';
import { HealthController } from './health.controller';

let bootstrap = async () => {
  const app = new ShamanExpressApp();
  // when you compose your app, you get a 'container' object to register dependencies
  let container = await app.compose();
  // The built-in 'SHAMAN_API_TYPES.ApiController' will automatically register your controller
  container.bind<ShamanExpressController>(SHAMAN_API_TYPES.ApiController).to(HealthController);
  // initialize the express.js router instance (attaches all registered controllers)
  app.configureRouter();
  // starts the API listener, if no port is provided at construction default port will be 5000
  await app.startApplication();
}

bootstrap().catch(ex => {
  console.error(ex);
  process.exit(1);
});
```

Your API server is now ready to go! Simply build your application (using tsc command), navigate to your output folder, then run:

```
node main.js
```

## Application Configuration
The shaman-api library comes with application configuation logic built-in, all you need to do is provide a path to your JSON configuration file when constructing the ShamanExpressApp class. For example, if I have a project with the following layout:

```bash
.
|__app.config.ts
|__config.json
|__main.ts
|__health.controller.ts
```

To register your configuration file (config.json) simple update the 'bootstrap' command in your main.ts file to have the following ShamanExpressApp construction:

```ts
...
const app = new ShamanExpressApp({configPath: path.join(__dirname, 'config.json')});
...
```
*NOTE: path.join requires that you import the built-in Node JS 'path' module.*

Now, to use app configuration anywhere in your application, simply inject your app config (with types defined in app.config.ts) into any service that is managed by the build-in dependency injection. For example, I could update my health.controller.ts file to include my app config like so:

```ts
import { AppConfig } from './app.config.ts';
...

export class HealthController implements ShamanExpressController {

  ...

  constructor(@inject(SHAMAN_API_TYPES.AppConfig) private config: AppConfig) {}

  ...

}
```

## Composing dependencies
Dependency injection in shaman-api is managed by [InversifyJS](https://inversify.io/), and the ShamanExpressApp class provides an easy mechanism to provide your own dependencies. After constructing a ShamanExpressApp instance you will need to call 'compose', which will return an InversifyJS 'Container' instance that you can use to inject controllers / services / providers / factories /etc. Anything that is added to dependency injection can reference anything else that is available in the DI container. For more information on how to manage dependency injection, please visit the [InversifyJS](https://inversify.io/) homepage. 

*NOTE: It is highly recommended that you do not compose things outside of the DI container (with obvious exceptions for things like dynamic composition).*

## Application Modules
The shaman-api library includes a mechanism for grouping controllers / services / etc. into isolated groups, which can be helpful for a number of reasons:

- Security (no cross polution within DI container)
- Runtime segregation (for example, v1, v2, etc.)
- Plugin interfaces
- ...Plenty more
  
View modules included in the shaman-api library [here](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules).

The application module interface looks like this:

```ts
import { Container } from "inversify";
import { ShamanExpressController } from "./shaman-express-controller";
export declare abstract class ShamanExpressModule {
    abstract name?: string;
    abstract compose: (container: Container) => Promise<Container>;
    isolated: boolean = false;
    export?: (container: Container) => Promise<void>;
}
```
For example, imagine a project with the following layout:

```bash
.
|__module1
| |__module1.controller.ts
| |__module1.service.ts
| |__module1.module.ts
| |__module1.types.ts
|__app.config.ts
|__config.json
|__main.ts
|__health.controller.ts
```

Module definition belongs in the module1.module.ts file, and could look something like this:

```ts
import { Container } from "inversify";
import { ShamanExpressModule, SHAMAN_API_TYPES } from "shaman-api";

import { MODULE1_TYPES } from "./module1.types";
import { Module1Service } from "./module1.service";
import { Module1Controller } from "./module1.controller";

export class SampleModule extends ShamanExpressModule {
  name: string = 'module1';
  compose = (container: Container): Promise<Container> => {
    container.bind<Module1Service>(MODULE1_TYPES.Module1Service).To(Module1Service)
    container.bind<Module1Controller>(SHAMAN_API_TYPES.ApiController).to(Module1Controller);
    return Promise.resolve(container);
  }
  export = (container: Container): Promise<void> => {
    // this method is optional, as many module will be completely isolated.
    // however, if you want to expose things outside the module, this is where you can do so.
    container.bind<Module1Service>(MODULE1_TYPES.Module1Service).To(Module1Service);
  }
}
```

To configure this module into the larger application ecosystem, simply provide a list of modules to the "configureRouter" method invocation in your main.ts 'bootstrap' method. For example:

```ts
import { SampleModule } from './module1/module1.module';
...

let bootstrap = async () => {
  ...
  app.configureRouter([new SampleModule()]);
  ...
}
```

Any controller that is composed inside of a module using the "SHAMAN_API_TYPES.ApiController" type will automatically be added to your express api, making it available via HTTP requests. If you set the module's "isolated" variable to 'false' (default, no override needed) then the component will automatically get access to the parent application module (from main.ts); if you provide the value and set it to 'true', the module will get its own isolated container, and will not have access to anything in the parent container. 