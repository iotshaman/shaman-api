export class RouteError extends Error {
  statusCode: number;
  sendMessage: boolean;
  constructor(message: string, statusCode: number, sendMessage: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.sendMessage = sendMessage;
  }
}