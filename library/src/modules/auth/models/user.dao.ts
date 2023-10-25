import { User } from "./user.model";

export interface IUserDao {
  getUserByEmail: (email: string) => Promise<User>;
  getUserPermissions: (email: string) => Promise<string[]>;
}