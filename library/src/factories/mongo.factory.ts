import 'reflect-metadata';
import { injectable } from 'inversify';
import { Mongoose } from 'mongoose';

export interface IMongoFactory {
  GetMongoConnection(): Mongoose;
}

@injectable()
export class MongoFactory implements IMongoFactory {

  private mongo: Mongoose;

  constructor(mongo: Mongoose) {
    this.mongo = mongo;
  }

  GetMongoConnection = () => {
    return this.mongo;
  }

}