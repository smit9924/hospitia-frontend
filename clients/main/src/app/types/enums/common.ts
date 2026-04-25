export enum GenericDialogButtonType {
  FILLED = 'filled',
  OUTLINED = 'outlined',
  LINK = 'link',
  TONAL = 'tonal',
  ICON = 'icon',
}

export enum GenericSnackbarType {
  DEFAULT = 'default',
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export enum GenericSnackbarDuration {
  /** Snackbar duration in milliseconds */
  SHORT = 3000,
  MEDIUM = 5000,
  LONG = 10000,
  INFINITE = 0, // Special value to indicate the snackbar should stay open until dismissed
}

export enum BANNER_TYPES {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  SUCCESS = 'success',
}

export enum HTTP_REQ_TIMEOUT {
  DISABLED = -1,
  TIMEOUT_10S = 10000,
  TIMEOUT_20S = 20000,
  TIMEOUT_30S = 30000,
  TIMEOUT_40S = 40000,
  TIMEOUT_50S = 50000,
  TIMEOUT_60S = 60000,
}
