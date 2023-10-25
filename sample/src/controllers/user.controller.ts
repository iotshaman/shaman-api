/* istanbul ignore file */
import { Application, Request, Response, Router } from "express";
import { inject, injectable } from "inversify";
import { AuthorizeControllerBase, ILogger, IShamanAuthService, SHAMAN_API_TYPES, SHAMAN_AUTH_TYPES, ShamanExpressController } from "shaman-api";
import { IUserService } from "../services/user.service";
import { SAMPLE_TYPES } from "../sample.types";

@injectable()
export class UserController extends AuthorizeControllerBase implements ShamanExpressController {

  name: string = 'user';

  constructor(
    @inject(SAMPLE_TYPES.UserDao) private userService: IUserService,
    @inject(SHAMAN_AUTH_TYPES.ShamanAuthService) authService: IShamanAuthService,
    @inject(SHAMAN_API_TYPES.Logger) private logger: ILogger,
  ) {
    super(authService, ['Admin']);
  }

  configure = (express: Application) => {
    let router = Router();
    router
      .get('/all', this.authorize, this.getAllUsers)
      .get('/:emailAddress', this.getUserByEmail)
      .get('/:emailAddress/permission', this.getUserPermissions)

    express.use('/api/user', router);
  }

  getUserByEmail = (req: Request, res: Response, _next: any) => {
    const email = req.params.emailAddress;
    this.userService.getUserByEmail(email)
      .then(user => res.json({ user: user }))
      .catch(err => {
        this.logger.write(err.message, 'error');
        res.status(500).send();
      });
  }

  getUserPermissions = (req: Request, res: Response, _next: any) => {
    const email = req.params.emailAddress;
    this.userService.getUserPermissions(email)
      .then(permissions => res.json({ permissions: permissions }))
      .catch(err => {
        this.logger.write(err.message, 'error');
        res.status(500).send();
      });
  }

  getAllUsers = (_req: Request, res: Response, _next: any) => {
    this.userService.getAllUsers()
      .then(users => res.json({ users: users }))
      .catch(err => {
        this.logger.write(err.message, 'error');
        res.status(500).send();
      });
  }

}