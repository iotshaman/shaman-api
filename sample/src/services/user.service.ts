import { User } from "../models/user.model";
import * as _fsx from "fs-extra";
import { injectable } from "inversify";
import * as _path from "path";
import { Permission } from "../models/permission.model";
import { UserPermission } from "../models/user.permission.model";

export interface IUserService {
  getUserByEmail: (email: string) => Promise<User>;
  getUserPermission: (email: string) => Promise<string[]>;
}

@injectable()
export class UserService implements IUserService {
  private dataPath: string = "C:\\Users\\Klein\\Development\\_work\\iotshaman\\shaman-api\\sample\\data\\";

  getUserByEmail = (email: string): Promise<User> => {
    const userDataPath: string = _path.join(this.dataPath, "user.data.json");
    return new Promise((resolve, reject) => {
      _fsx.readJson(userDataPath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          const user: User = data["users"].find((u: User) => u.emailAddress === email);
          resolve(user);
        }
      });
    });
  }

  getUserPermission = (email: string): Promise<string[]> => {
    const permissionDataPath: string = _path.join(this.dataPath, "permission.data.json");
    const userPermissionDataPath: string = _path.join(this.dataPath, "user.permission.data.json");
    return new Promise((resolve, _reject) => {
      this.getUserByEmail(email)
        .then(user => {
          _fsx.readJson(userPermissionDataPath, (_err, data) => {
            let permissionIds = data["userPermissions"]
              .filter((up: UserPermission) => up.userId === user.userId)
              .map((up: UserPermission) => up.permissionId);
            _fsx.readJson(permissionDataPath, (_err, data) => {
              let permissions = data["permissions"]
                .filter((p: Permission) => permissionIds.includes(p.permissionId))
                .map((p: Permission) => p.permissionName);
              resolve(permissions);
            });
          })
        });
    })
  }

};
