import { inject, injectable } from "inversify";
import * as _path from "path";
import { IJsonService, IUserDao, SHAMAN_API_TYPES } from "shaman-api";
import { Permission } from "../models/permission.model";
import { User } from "../models/user.model";
import { UserPermission } from "../models/user.permission.model";

export interface IUserService extends IUserDao {
  getUserByEmail: (email: string) => Promise<User>;
  getUserPermissions: (email: string) => Promise<string[]>;
  getAllUsers: () => Promise<User[]>;
}

@injectable()
export class UserService implements IUserService {

  private dataPath: string = _path.join(__dirname, "..", "..", "data");

  constructor(
    @inject(SHAMAN_API_TYPES.ApiService) private jsonService: IJsonService
  ) { }

  getUserByEmail = (email: string): Promise<User> => {
    const userDataPath: string = _path.join(this.dataPath, "user.data.json");
    return this.jsonService.getJson(userDataPath).then(data => {
      const user: User = data["data"].find((u: User) => u.emailAddress === email);
      if (!user) return Promise.reject(new Error("User not found"));
      return user;
    });
  }

  getUserPermissions = (email: string): Promise<string[]> => {
    return this.getUserByEmail(email)
      .then(user => (this.getUserPermissionIds(user)))
      .then(permissionIds => (this.getPermissionsByIds(permissionIds)))
      .then(permissions => (permissions.map(p => p.permissionName)));
  };

  getAllUsers = (): Promise<User[]> => {
    const userDataPath: string = _path.join(this.dataPath, "user.data.json");
    return this.jsonService.getJson(userDataPath).then(data => {
      const users: User[] = data["data"];
      return users;
    });
  }

  private getUserPermissionIds = (user: User): Promise<number[]> => {
    const userPermissionDataPath: string = _path.join(this.dataPath, "user.permission.data.json");
    return this.jsonService.getJson(userPermissionDataPath).then(data => {
      const permissionIds: number[] = data["data"]
        .filter((up: UserPermission) => up.userId === user.userId)
        .map((up: UserPermission) => up.permissionId)
      return permissionIds;
    });
  }

  private getPermissionsByIds = (permissionIds: number[]): Promise<Permission[]> => {
    const permissionDataPath: string = _path.join(this.dataPath, "permission.data.json");
    return this.jsonService.getJson(permissionDataPath).then(data => {
      const permissions: Permission[] = data["data"]
        .filter((p: Permission) => permissionIds.includes(p.permissionId));
      return permissions;
    });
  }

};
