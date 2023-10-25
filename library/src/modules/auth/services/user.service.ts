import { injectable } from "inversify";
import { comparePasswordToHash } from "../functions/password.functions";
import { UserPermissionMap } from "../models/auth/user-permission-map.model";
import { IUserDao } from "../models/user.dao";
import { User } from "../models/user.model";

export interface IUserService {
  getUserWithPermissions: (email: string) => Promise<UserPermissionMap>;
  authenticateUser: (email: string, password: string) => Promise<User>;
}

@injectable()
export class UserService implements IUserService {

  constructor(private userDao: IUserDao) { }

  getUserWithPermissions = (email: string): Promise<UserPermissionMap> => {
    const user = this.userDao.getUserByEmail(email);
    const permissions = this.userDao.getUserPermissions(email);
    return Promise.all([user, permissions]).then(results => {
      let [user, permissions] = results;
      return { user, permissions };
    });
  };

  authenticateUser = (email: string, password: string): Promise<User> => {
    return this.userDao.getUserByEmail(email)
      .then(user => {
        let match = comparePasswordToHash(password, user.passwordHash);
        if (!match) throw new Error("Password is invalid.");
        return user;
      })
  };

}