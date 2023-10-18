import { UserPermissionMap } from "../models/auth/user-permission-map.model";
import { IUserDao } from "../models/user.dao";
import { User } from "../models/user.model";

export interface IUserService {
  getUserWithPermissions: (email: string) => Promise<UserPermissionMap>;
  authenticateUser: (email: string, password: string) => Promise<User>;
}

export class UserService implements IUserService {

  constructor(private userDao: IUserDao) { }

  getUserWithPermissions = (email: string): Promise<UserPermissionMap> => {
    const user = this.userDao.getUserByEmail(email);
    const permissions = this.userDao.getUserPermission(email);
    return Promise.all([user, permissions]).then(results => {
      let [user, permissions] = results;
      return { user, permissions };
    });
  };

  authenticateUser: (email: string, password: string) => Promise<User>;

}