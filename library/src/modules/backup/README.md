# Shaman Dump Module

The `ShamanDumpModule` provides an API endpoint for dumping the contents of a database. The [`ShamanAuthModule`](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/auth) is required for this module to work, and the user must have the `dump` permission.

## Implementation

To implement the `ShamanDumpModule`, you must:

1. Implement the [`ShamanAuthModule`](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/auth).
2. Ensure at lease one user has a permissions named `dump`.
3. Create a configuration file which implements the [`ShamanDumpConfig`](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/dump/modles) type.
4. Configure your `ShamanExpressApp` to use the `ShamanDumpModule`.

### Step 1

**Implement the [`ShamanAuthModule`](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/auth)** as described in the README.

### Step 2

**Ensure at lease one user has a permissions named `dump`**.

### Step 3

**Create a configuration file which implements the [`ShamanDumpConfig`](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/dump/modles) type**. The `ShamanDumpConfig` type is defined as:

```typescript
export type ShamanDumpConfig = {
  allowUnsecureConnection?: boolean;
  databases: DatabaseConfig[];
};

export type DatabaseConfig = {
  type: string;
  name: string;
  filepath?: string;
  username?: string;
  password?: string;
};
```

Depending on the database being targeted for dumping, certain properties are required:

| Database Type | Required Properties                    |
| ------------- | -------------------------------------- |
| `sqlite`      | `type`, `name`, `filepath`             |
| `jsonRepo`    | `type`, `name`, `filepath`             |
| `mysql`       | `type`, `name`, `username`, `password` |

Note: This config can be apart of your main config file, or it can be a separate file. If you choose to include this config in your main config file, the ShamanDumpConfig must be included in a root level object named `dump`. If you choose to use a separate file, you must include the path to the file when instantiating the `ShamanDumpModule` (see [step 4](#step-4)).

### Step 4

**Configure your `ShamanExpressApp` to use the `ShamanDumpModule`**.

```typescript
import * as _path from "path";
import { ShamanAuthModule, ShamanExpressApp } from "shaman-api";
import { UserService } from "./services/user.service";

let bootstrap = async () => {
  // include your configuration file paths when instantiating ShamanExpressApp
  const configPath = _path.join(__dirname, "path", "to", "config.json");
  const dumpConfigPath = _path.join(__dirname, "..", "app", "dump.config.json");

  const app = new ShamanExpressApp({ configPath: configPath });

  // compose the application
  let container = await app.compose();

  // bind a Service which complies with IUserDoa
  container.bind<UserService>("UserDoa").to(UserService);

  // configureRouter, including the ShamanAuthModule and ShamanDumpModule
  await app.configureRouter([
    new ShamanAuthModule(container.get("UserDoa")),
    new ShamanDumpModule(dumpConfigPath) // passing in the path to the dump config file is only required if the dump config is in a separate file from the main config.
  ]);

  // start the application 😎
  await app.startApplication();
};

bootstrap().catch((ex) => {
  console.error(ex);
  process.exit(1);
});
```
