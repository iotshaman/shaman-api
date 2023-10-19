// import { Container } from 'inversify';
// import { IUserService, UserService } from '../services/user.service';

// export async function Compose(container: Container): Promise<Container> {
//   await registerServices(container);
//   return Promise.resolve(container);
// }

// function registerServices(container: Container): Promise<Container> {
//   container.bind<IUserService>(TYPES.UserService).to(UserService);
//   return Promise.resolve(container);
// }