import { GenericDialogButtonType } from '../enums/common';
import { ErrorCodes } from '../enums/error-codes';

export interface ApiErrorResponse<T> {
  metadata: T;
  message: string;
  errorCode: ErrorCodes;
}

/** Flags passed with a navigation as router state (`NavigationExtras.state`). */
export interface AppNavigationState {
  /** The navigation was started by a successful signup. */
  afterSignup?: boolean;
}

export interface GenericDialogButtonMetadata {
  label: string;
  closeOnClick: boolean;
  type: GenericDialogButtonType;
  iconName?: string;
  callback?: () => void;
}
