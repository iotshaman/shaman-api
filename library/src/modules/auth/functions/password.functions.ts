import * as _bcrypt from 'bcryptjs';

export function comparePasswordToHash(password: string, passwordHash: string): boolean {
  return _bcrypt.compareSync(password, passwordHash);
}