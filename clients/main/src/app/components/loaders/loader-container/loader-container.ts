import { Component, inject } from '@angular/core';
import { Spinner } from '../spinner/spinner';
import { AccountSetupLoader } from '../account-setup-loader/account-setup-loader';
import { Loader } from '../../../services/loader';

@Component({
  selector: 'app-loader-container',
  imports: [Spinner, AccountSetupLoader],
  templateUrl: './loader-container.html',
  styleUrl: './loader-container.scss',
})
export class LoaderContainer {
  protected readonly loaderService = inject(Loader);
}
