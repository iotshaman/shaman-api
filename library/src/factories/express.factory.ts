import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from 'cors';
import * as compression from 'compression';
import { Application } from 'express';
import { ShamanExpressAppConfig } from '../shaman-express-app.config';

const defaultHeaders: string[] = [
  'Content-Type',
  'Data-Type',
  'Authorization'
];

export const ExpressFactory = {
  GenerateApplication: (config: ShamanExpressAppConfig): Application => {
    let app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(compression());
    if (!config.disableCors) {
      app.use(cors({
        credentials: true, 
        methods: 'GET,POST,PUT,DELETE,PATCH',
        allowedHeaders: (config.headerAllowList || defaultHeaders).join(','),
      }));
    }
    return app;
  }
}