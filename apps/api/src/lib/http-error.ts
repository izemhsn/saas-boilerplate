// An error with an HTTP status code, for "expected" problems like a missing user.
// Services throw it, and the error handler sends its status and message to the client:
//   throw new HttpError(404, 'User not found');
export class HttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}
