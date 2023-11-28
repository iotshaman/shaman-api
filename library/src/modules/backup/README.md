# Shaman Backup Module

The `ShamanBackupModule` offers an API endpoint that enables the creation and retrieval of a database backup. 
- [Shaman Backup Module](#shaman-backup-module)
  - [Requirements](#requirements)
  - [Implementation](#implementation)
    - [Step 1](#step-1)
    - [Step 2](#step-2)
    - [Step 3](#step-3)
    - [Step 4](#step-4)
  - [ShamanBackupController](#shamanbackupcontroller)
    - [Backup](#backup)
  - [Services](#services)
    - [ShamanBackupService](#shamanbackupservice)

## Requirements

The `ShamanBackupModule` requires the following:

1. The [`ShamanAuthModule`](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/auth).
2. At least one user with a permissions named `backup`.
3. A configuration file which implements the [`ShamanBackupConfig`](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/backup/modles).
4. Any database being targeted must be located on the same server running the Shaman API.

## Implementation

To implement the `ShamanBackupModule`, you must:

1. Implement the [`ShamanAuthModule`](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/auth).
2. Ensure at lease one user has a permissions named `backup`.
3. Create a configuration file which implements the [`ShamanBackupConfig`](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/backup/modles) type.
4. Configure your `ShamanExpressApp` to use the `ShamanBackupModule`.

### Step 1

**Implement the [`ShamanAuthModule`](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/auth)** as described in the README.

### Step 2

**Ensure at lease one user has a permissions named `backup`**.

### Step 3

**Create a configuration file which implements the [`ShamanBackupConfig`](https://github.com/iotshaman/shaman-api/tree/master/library/src/modules/backup/modles) type**. An example of a configuration file is shown below:

```typescript
{
  "allowUnsecureConnection": false,
  "databases": [
    {
      "type": "json-repo",
      "name": "myJsonRepo",
      "filepath": "data/json-repo-db.json"
    },
    {
      "type": "sqlite",
      "name": "mySqliteDatabase",
      "filepath": "data/sqlite-db.sqlite"
    }
    {
      "type": "mysql",
      "name": "mySqlDatabase",
      "username": "myUsername",
      "password": "myPassword"
    }
  ]
}
```

By default, a secure connection is required to access the backup endpoint. However, this can be overridden by setting the `allowUnsecureConnection` property to `true` in the `ShamanBackupConfig`. **It is not recommended to allow unsecure connections to the backup endpoint**, but it may be useful to do so during the development or testing process.

Depending on the database being targeted, certain properties are required:

| Database Type | Required Properties                    |
| ------------- | -------------------------------------- |
| `sqlite`      | `type`, `name`, `filepath`             |
| `jsonRepo`    | `type`, `name`, `filepath`             |
| `mysql`       | `type`, `name`, `username`, `password` |

The following table describes the properties of the `ShamanBackupConfig`:

| Property Name | Description                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------- |
| `type`        | The type of database to backup. This property must match a database type from the table above.            |
| `name`        | The name of the database. This is used to target a database to backup when using the backup api endpoint. If targeting a mysql database, the name must match the database name used by mysql as well. |
| `filepath`    | The path to the database file.                                                                            |
| `username`    | The username of a user who has access to the database.                                                    |
| `password`    | The password for the user.                                                                                |

**_Note_**: This config can be apart of your main config file and passed into your `ShamanExpressApp` during composition, or it can be a separate file and passed into the `ShamanDumpModule`. If you choose to include this config in your main config file, the `ShamanBackupConfig` must be included in a root level object named `backup`. If you choose to use a separate file, you must include the path to the file when instantiating the `ShamanBackupModule` (see [step 4](#step-4)).

```json
// Example of the ShamanBackupConfig in the main config file
{
  "foo": "bar",
  "backup": { <-- this is required if the backup config is in the main config file
    "allowUnsecureConnection": false,
    "databases": [ ... ]
  }
}
```

### Step 4

**Configure your `ShamanExpressApp` to use the `ShamanBackupModule`**.

```typescript
import * as _path from "path";
import { ShamanAuthModule, ShamanExpressApp } from "shaman-api";
import { UserService } from "./services/user.service";

let bootstrap = async () => {
  // include your configuration file paths when instantiating ShamanExpressApp
  const mainConfigPath = _path.join(__dirname, "path", "to", "config.json");
  const backupConfigPath = _path.join(__dirname, "path" "to", "backup.config.json");

  const app = new ShamanExpressApp({ configPath: mainConfigPath });

  // compose the application
  let container = await app.compose();

  container.bind<UserService>("UserDoa").to(UserService);

  // configureRouter, including the ShamanAuthModule and ShamanBackupModule
  await app.configureRouter([
    new ShamanAuthModule(container.get("UserDoa")),
    new ShamanBackupModule(backupConfigPath).
  ]);

  // start the application 😎
  await app.startApplication();
};

bootstrap().catch((ex) => {
  console.error(ex);
  process.exit(1);
});
```

## ShamanBackupController

After implementing the ShamanBackupModule, you will now have access to the ShamanBackupController and its api endpoint.

**Base Endpoint**  
`/api/backup`

One endpoint is available within the Backup Controller:

### Backup

**Endpoint**  
`GET /api/backup/:dbName`

**Authorization**

- `Bearer`: A valid JWT token is required. The user must have a permissions named `backup`.

**Request Parameter**

- `dbName`: The name of the database you want to backup. This must match the name of a database in the `ShamanBackupConfig` (see [step 3](#step-3)).

**Response**

- `200`: The backup file is returned as a download response.
- `400`: The database name was not provided.
- `500`: An error occurred while attempting to backup the database.

**Description**  

This endpoint creates and returns a backup file for the database being targeted. It gets the database name from the request parameters. If the database name is not provided, it responds with a status code of 400. Otherwise, it creates a backup of the targeted database. If the backup is successful, it sends the backup as a download response. If an error occurs, it responds with a status code of 500.

## Services

While using the `ShamanBackupModule`, you will also have access one service which can be injected into your application.

### ShamanBackupService

This class is responsible for managing the backup process of databases. It is recommended to only use this class if you are implementing your own backup endpoint. Otherwise, you should use the ShamanBackupController. The ShamanBackupService has a single method:

- `getBackup(dbName: string): Promise<string>`: This method creates a backup of the database being targeted. It returns the path to the backup file.