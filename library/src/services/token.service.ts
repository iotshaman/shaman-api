import 'reflect-metadata';
import { injectable } from "inversify";

export interface ITokenService {
  GetToken(key: string): string;
}

@injectable()
export class TokenService implements ITokenService {

  constructor(private tokens: {[key: string]: string}) {}

  GetToken = (key: string): string => {
    return this.tokens[key];
  }

}