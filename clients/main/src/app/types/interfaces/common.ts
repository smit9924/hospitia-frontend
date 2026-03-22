import { ErrorCodes } from '../enums/error-codes';

export interface ApiErrorResponse<T> {
  metadata: T;
  message: string;
  errorCode: ErrorCodes;
}
