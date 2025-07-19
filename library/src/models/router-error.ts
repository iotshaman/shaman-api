export class RouteError extends Error {
  statusCode: number;
  original?: any;
  constructor(message: string, statusCode: number, original?: any) {
    super(message);
    this.statusCode = statusCode;
    this.original = original;
  }
}