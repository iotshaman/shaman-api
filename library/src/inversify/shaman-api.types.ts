import 'reflect-metadata';

const ShamanApiTypes = {
  MongoFactory: Symbol.for("MongoFactory"),
  TokenService: Symbol.for("TokenService"),
  LoggerService: Symbol.for("LoggerService")
};

export { ShamanApiTypes };