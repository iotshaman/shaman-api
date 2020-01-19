import { Container } from "inversify";
import { ShamanApiTypes } from '../inversify/shaman-api.types';
import { ITokenService, TokenService } from "../services";
import "reflect-metadata";

export const TokenServiceContainer = new Container();

export const TokenServiceProvider = {
  GetTokenService: function() {
    return TokenServiceContainer.get<ITokenService>(ShamanApiTypes.TokenService);
  }
}

export function InitializeTokenService(tokens: {[key:string]: string}) {
  TokenServiceContainer
    .bind<ITokenService>(ShamanApiTypes.TokenService)
    .toConstantValue(new TokenService(tokens));
}