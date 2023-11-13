import { injectable } from "inversify";
import { ShamanDumpConfig } from "../models/shaman-dump.config";

export interface IShamanDumpService {
  
}

@injectable()
export class ShamanDumpService implements IShamanDumpService {

  constructor(private dumpConfig: ShamanDumpConfig) { }

}