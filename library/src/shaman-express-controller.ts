import { Application } from 'express';

export interface ShamanExpressController {
  name: string;
  configure: (express: Application) => void;
}