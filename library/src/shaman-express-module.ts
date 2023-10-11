import { Container } from "inversify";
import { ShamanExpressController } from "./shaman-express-controller";
import { SHAMAN_API_TYPES } from "./composition.types";

/* istanbul ignore next */
export abstract class ShamanExpressModule {
  abstract name?: string;
  isolated: boolean = false;
  controllers = (container: Container): ShamanExpressController[] => {
    return container.getAll<ShamanExpressController>(SHAMAN_API_TYPES.ApiController);
  };
  abstract compose: (container: Container) => Promise<Container>;
  export?: (container: Container) => Promise<void>;
}