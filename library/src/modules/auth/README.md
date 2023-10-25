# Shaman Auth Module

The `ShamanAuthModule` simplifies the process of implementing authentication and authorization in your application. It offers a service that enables user authentication and a guard that can be used to secure routes.

## Implementation

To implement the `ShamanAuthModule`, you must:

1. Create a Service or Data Access Model which complies with the `IUserDao` interface.
2. Create a configuration file which includes a `tokenSecret` property.
3. Configure your `ShamanExpressApp` to use the `ShamanAuthModule`.

### Step 1

**Create a Service or Data Access Model which complies with the `IUserDao` interface**. This service will be used to retrieve user information from your database. The `IUserDao` interface is defined as follows:

```typescript
export interface IUserDao {
  getUserByEmail: (email: string) => Promise<User>;
  getUserPermissions: (email: string) => Promise<string[]>;
}

// ... where User is defined as follows:
export abstract class User {
  emailAddress: string;
  passwordHash: string;
}
```

To ensure your Service complies with the `IUserDao` interface, it's highly recommended you extend `IUserDao` through your own interface:

```typescript
import { inject, injectable } from "inversify";
import { IUserDao } from "shaman-api";
import { User } from "../models/user.model";

export interface IUserService extends IUserDao {
  getUserByEmail: (email: string) => Promise<User>;
  getUserPermissions: (email: string) => Promise<string[]>;
}

@injectable()
export class UserService implements IUserService {
  /* code here */
}
```

... or have your Service implement `IUserDao` directly:

```typescript
import { inject, injectable } from "inversify";
import { IUserDao } from "shaman-api";
import { User } from "../models/user.model";

@injectable()
export class UserService implements IUserDao {
  // implement IUserDao
}
```

### Step 2

**Create a configuration file which includes a `tokenSecret` property.** This property is used to sign and verify JWT tokens. The `ShamanAuthModule` will look for a `tokenSecret` property in the `auth` section of your configuration file. For example:

```json
{
  "auth": {
    "tokenSecret": "my-secret"
  }
}
```

Note: For security reasons, **it is recommended you do not push your configuration file to a remote repository**.

### Step 3

**Configure your `ShamanExpressApp` to use the `ShamanAuthModule`**.

With your service and configuration file place, you can now implement the `ShamanAuthModule` in your application:

```typescript
import * as _path from "path";
import { ShamanAuthModule, ShamanExpressApp } from "shaman-api";
import { UserService } from "./services/user.service";

let bootstrap = async () => {
  // include your configuration file path when instantiating ShamanExpressApp
  let configPath = _path.join(__dirname, "path", "to", "config.json");
  const app = new ShamanExpressApp({ configPath: configPath });

  // compose the application
  let container = await app.compose();

  // bind a Service which complies with IUserDoa
  container.bind<UserService>("UserDoa").to(UserService);

  // configureRouter, including the ShamanAuthModule
  await app.configureRouter([new ShamanAuthModule(container.get("UserDoa"))]);

  // start the application 😎
  await app.startApplication();
};

bootstrap().catch((ex) => {
  console.error(ex);
  process.exit(1);
});
```
