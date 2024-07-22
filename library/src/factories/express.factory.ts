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
    if (!config.bodyParser) {
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: false }));
    } else {
      app.use(bodyParser.json({limit: config.bodyParser.limit || "2mb"}));
      app.use(bodyParser.urlencoded({
        limit: config.bodyParser.limit || "2mb", 
        extended: !!config.bodyParser.extended, 
        parameterLimit: config.bodyParser.parameters || 1000
      }));
    }
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