import { GenericDialogButtonType } from '../enums/common';
import { ErrorCodes } from '../enums/error-codes';

export interface ApiErrorResponse<T> {
  metadata: T;
  message: string;
  errorCode: ErrorCodes;
}

export interface GenericDialogButtonMetadata {
  label: string;
  closeOnClick: boolean;
  type: GenericDialogButtonType;
  iconName?: string;
  callback?: () => void;
}
