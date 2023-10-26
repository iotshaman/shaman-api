# Shaman Auth Module

The `ShamanAuthModule` simplifies the process of implementing authentication and authorization in your application. It offers a service that enables user authentication and a guard that can be used to secure routes.

- [Shaman Auth Module](#shaman-auth-module)
  - [Implementation](#implementation)
    - [Step 1](#step-1)
    - [Step 2](#step-2)
    - [Step 3](#step-3)
  - [ShamanAuthController](#shamanauthcontroller)
    - [Authenticate](#authenticate)
    - [Token](#token)
  - [AuthorizeControllerBase](#authorizecontrollerbase)
  - [Services](#services)
    - [ShamanAuthService](#shamanauthservice)
    - [TokenService](#tokenservice)
    - [UserService](#userservice)

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

Note: For security reasons, this file should not be made public. **It is recommended you do not push your configuration file to a remote repository**.

### Step 3

**Configure your `ShamanExpressApp` to use the `ShamanAuthModule`**. With your service and configuration file place, you can now implement the `ShamanAuthModule` in your application:

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

## ShamanAuthController

After implementing the ShamanAuthModule, you will now have access to the ShamanAuthController and its api endpoints.

**Base Endpoint**  
`/api/auth`

Two endpoints are available within the Auth Controller:

### Authenticate

**Endpoint**  
`POST /api/auth/authenticate`

**Request Body**

- `email: string`: The email of the user to be authenticated.
- `password: string`: The password of the user to be authenticated.

**Response**

- `grant_type: string`: The type of grant requested. In this case, it will always be `code`.
- `authorization_code: string`: The authorization code generated for the user.
- `temporary: boolean`: A flag indicating whether the authorization code is temporary or not. In this case, it will always be `false`.

**Description**  
This endpoint is used to authenticate a user by checking their email and password. It expects a JSON request body with the `email` and `password` fields. If either of them is missing, it returns an error with a status code of 400. Otherwise, it calls the `authenticateUser` method of the `userService` object, passing in the email and password. If the authentication is successful, it creates an authorization code for the user using the `createUserAuthCode` method of the `authService` object and sends it back as a JSON response with a status code of 200. If the authentication fails, it returns an error with a status code of 401.

### Token

**Endpoint**  
`POST /api/auth/token`

**Request Body**

- `grant_type: string`: The type of grant requested. It can be either `code` or `refresh_token`.
- `authorization_code: string` (optional): The authorization code generated during the authentication process. Required if `grant_type` is `code`.
- `refresh_token: string` (optional): The refresh token generated during the authentication process. Required if `grant_type` is `refresh_token`.

**Response**

- `emailAddress: string`: The email address of the user the passport was generated for.
- `access_token: string`: The access token generated for the user.
- `refresh_token: string`: The refresh token generated for the user.
- `accessTokenExpires: string`: The expiration date and time of the access token.
- `refreshTokenExpires: string`: The expiration date and time of the refresh token.

**Description**

This endpoint is used to retrieve a user's passport based on a grant type and authorization code or refresh token. It expects a JSON request body with the `grant_type` field, which can be either `code` or `refresh_token`, and either the `authorization_code` or `refresh_token` field, depending on the grant type. If the grant type is invalid or the required field is missing, it returns an error with a status code of 400. Otherwise, it calls the `getUserPassport` method of the `tokenService` object, passing in the authorization code or refresh token. If the passport retrieval is successful, it sends back the access token and refresh token as a JSON response with a status code of 200. If the passport retrieval fails, it returns an error with a status code of 401.

## AuthorizeControllerBase

This class is a base class for controllers that require authorization. It provides two methods: `authorize` and `getEmailFromToken`. The `authorize` method is used to authorize a user based on their authentication token and permissions. It calls the `authorize` method of the `authService` object, passing in the token value and the required permissions. If the authorization is successful, it calls the `next` callback function. If the authorization fails, it returns an error with a status code of 401 or 403, depending on the reason for the failure. The `getEmailFromToken` method is used to extract the email address of the user associated with the authentication token. It calls the `getEmailFromToken` method of the `authService` object, passing in the `Authorization` header of the request.

**Constructor**

- `authService: IShamanAuthService`: An object implementing the `IShamanAuthService` interface, used for authentication and authorization.
- `permissions: string[]`: An optional array of strings representing the permissions required for the authorized endpoint. Defaults to an empty array.

**Methods**

- `authorize(req: Request, _res: Response, next: any): void`: A method used to authorize a user based on their authentication token and permissions. It first extracts the token data from the `Authorization` header of the request. If the token is invalid or not a bearer token, it returns an error with a status code of 400 or 401. Otherwise, it calls the `authorize` method of the `authService` object, passing in the token value and the required permissions. If the authorization is successful, it calls the `next` callback function. If the authorization fails, it returns an error with a status code of 401 or 403, depending on the reason for the failure.
- `getEmailFromToken(req: Request): string`: A method used to extract the email address of the user associated with the authentication token. It takes a `Request` object as a parameter and returns a string representing the email address.

**Example**

```typescript
import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { AuthorizeControllerBase, IShamanAuthService, SHAMAN_AUTH_TYPES, ShamanExpressController } from "shaman-api";
import { IUserService } from "../services/user.service";
import { SAMPLE_TYPES } from "../sample.types";

@injectable()
export class UserController extends AuthorizeControllerBase implements ShamanExpressController { // 👈 Extend the AuthorizeControllerBase.

  name: string = 'user';

  constructor(
    @inject(SAMPLE_TYPES.UserDao) private userService: IUserService,
    @inject(SHAMAN_AUTH_TYPES.ShamanAuthService) authService: IShamanAuthService
  ) {
    super(authService, ['Admin']); // 👈 Invoke the superclass's constructor. Pass an Authorization Service of type `IShamanAuthService` and, optionally, permissions.
  }

  configure = (express: Application) => {
    let router = Router();
    router
      .get('/all', this.authorize, this.getAllUsers)
      // ☝️ This endpoint will now call `this.getAllUsers` only if the `Authorization` token data passes the `this.authorize` method.
      .get('/:emailAddress', this.getUserByEmail)
      .get('/:emailAddress/permission', this.getUserPermissions)

    express.use('/api/user', router);
  }

  getUserByEmail = (req: Request, res: Response, _next: any) => {
    // code here...
  }

  getUserPermissions = (req: Request, res: Response, _next: any) => {
   // code here...
  }

  getAllUsers = (_req: Request, res: Response, _next: any) => {
    // code here...
  }
```

## Services

While using the `ShamanAuthModule`, you will also have access to a few services which can be injected into your application.

**Example**

```typescript
// Injecting TokenService into SampleService
import { inject, injectable } from "inversify";
import {
  IShamanAuthService,
  ITokenService,
  SHAMAN_AUTH_TYPES
} from "shaman-api";

@injectable()
export class SampleService {
  constructor(
    @inject(SHAMAN_AUTH_TYPES.TokenService) private tokenService: ITokenService
  ) {}

  someMethod = (authCodeToken: string) => {
    this.tokenService.getAccessToken(authCodeToken)
      .then(token => {
        // do something...
      });
  }

}
```

### ShamanAuthService

This class is used for authentication and authorization. It provides four methods:

- `createUserAuthCode(user: User): string`: A method used to create an authentication code for a user. It takes a `User` object as a parameter and returns a string representing the authentication code.
- `getTokenData(token: string): TokenData`: A method used to extract the token data from an authentication token. It takes a string representing the authentication token as a parameter and returns a `TokenData` object.
- `authorize(accessToken: string, permissions: string[], connector?: string): AuthStatusCode`: A method used to authorize a user based on their authentication token and permissions. It takes a string representing the authentication token, an array of strings representing the required permissions, and an optional string representing the connector used to combine the permissions (defaults to "AND"). It returns an `AuthStatusCode` value representing the authorization status.
- `getEmailFromToken(token: string): string`: A method used to extract the email address of the user associated with an authentication token. It takes a string representing the authentication token as a parameter and returns a string representing the email address.

### TokenService

This class is used to generate and verify authentication tokens. It provides five methods:

- `getAccessToken(authCodeToken: string): Promise<AccessToken>`: A method used to generate an access token from an authentication code token. It takes a string representing the authentication code token as a parameter and returns a promise that resolves to an `AccessToken` object.
- `getRefreshToken(accessToken: AccessToken): Promise<RefreshToken>`: A method used to generate a refresh token from an access token. It takes an `AccessToken` object as a parameter and returns a promise that resolves to a `RefreshToken` object.
- `verifyRefreshToken(refreshToken: string): RefreshToken`: A method used to verify a refresh token. It takes a string representing the refresh token as a parameter and returns a `RefreshToken` object.
- `refreshAccessToken(refreshToken: string): Promise<AccessToken>`: A method used to generate a new access token from a refresh token. It takes a string representing the refresh token as a parameter and returns a promise that resolves to an `AccessToken` object.
- `getUserPassport(accessToken: AccessToken, refreshToken: RefreshToken): UserPassport`: A method used to generate a user passport object from an access token and a refresh token. It takes an `AccessToken` object and a `RefreshToken` object as parameters and returns a `UserPassport` object.

### UserService

This class is used to retrieve and authenticate user data. It provides two methods:

- `getUserWithPermissions(email: string): Promise<UserPermissionMap>`: A method used to retrieve a user and their permissions. It takes a string representing the email address of the user as a parameter and returns a promise that resolves to a `UserPermissionMap` object.
- `authenticateUser(email: string, password: string): Promise<User>`: A method used to authenticate a user. It takes a string representing the email address of the user and a string representing the password as parameters and returns a promise that resolves to a `User` object.
