import { User } from "./user.model";

export interface IUserDao {
  getUserByEmail: (email: string) => Promise<User>;
  getUserPermission: (email: string) => Promise<string[]>;
}