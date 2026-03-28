export class BackendError extends Error {
  statusCode: number;
  payload?: unknown;

  constructor(message: string, statusCode: number, payload?: unknown) {
    super(message);
    this.name = "BackendError";
    this.statusCode = statusCode;
    this.payload = payload;
  }
}
