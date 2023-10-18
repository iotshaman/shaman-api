import * as _bcrypt from 'bcryptjs';

export function generatePasswordHash(password: string): string {
  return _bcrypt.hashSync(password, _bcrypt.genSaltSync(8));
}

export function comparePasswordToHash(password: string, passwordHash: string): boolean {
  return _bcrypt.compareSync(password, passwordHash);
}