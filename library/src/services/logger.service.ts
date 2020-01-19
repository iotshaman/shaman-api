import "reflect-metadata";
import { format, createLogger, transports, Logger } from 'winston';
import { injectable } from 'inversify';

export interface ILoggerService {
  logger: Logger;
}

@injectable()
export class LoggerService implements ILoggerService {

  private _logger: Logger;
  public get logger(): Logger { return this._logger; }

  constructor() {
    let myFormat = format.printf(function(info) {
      return `${info.timestamp} ${info.level.toUpperCase()}: ${info.message}`;
    });
    this._logger = createLogger({
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'server.log' })
      ],
      format: format.combine(
        format.timestamp(),
        myFormat
      )
    });
  }
}