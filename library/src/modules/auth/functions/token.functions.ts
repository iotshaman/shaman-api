export function isTokenExpired(tokenExpires: string) {
  let now: Date = new Date(Date.parse(new Date().toISOString()));
  let expires: Date = new Date(Date.parse(tokenExpires));
  return now > expires;
}