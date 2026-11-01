import { GenericSnackbarType } from '../../../enums/common';

export class GenericSnackbarConfigData {
  text = '';
  showCloseButton = false;
  type: GenericSnackbarType = GenericSnackbarType.DEFAULT;
  /** Optional action button label, e.g. "Undo". No action button when empty. */
  actionLabel = '';
  /** Called when the action button is pressed; the snackbar then closes. */
  onAction?: () => void;

  constructor(data: Partial<GenericSnackbarConfigData>) {
    Object.assign(this, data);
  }
}
