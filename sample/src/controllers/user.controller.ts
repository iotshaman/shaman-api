/* istanbul ignore file */
import { Request, Response, Application, Router } from "express";
import { injectable, inject } from "inversify";
import { ShamanExpressController } from "shaman-api";
import { IUserService } from "../services/user.service";

@injectable()
export class UserController implements ShamanExpressController {

  name: string = 'user';

  constructor(
    @inject("UserService") private userService: IUserService
  ) { }

  configure = (express: Application) => {
    let router = Router();
    router
      .get('/:emailAddress', this.getUserByEmail)
      .get('/:emailAddress/permission', this.getUserPermission)
      .get('/test', this.test)

    express.use('/api/user', router);
  }

  getUserByEmail = (req: Request, res: Response, _next: any) => {
    const email = req.params.emailAddress;
    this.userService.getUserByEmail(email)
      .then(user => res.json({ user: user }))
      .catch(err => {
        console.error(err);
        res.status(500).send()
      });
  }

  getUserPermission = (req: Request, res: Response, _next: any) => {
    const email = req.params.emailAddress;
    this.userService.getUserPermission(email)
      .then(permissions => res.json({ permissions: permissions }))
      .catch(err => {
        console.error(err);
        res.status(500).send()
      });
  
  }

  test = (_req: Request, res: Response, _next: any) => {
    res.status(200).json({ test: 'test' });
  }
}