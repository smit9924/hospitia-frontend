import { Component, inject } from '@angular/core';
import { Spinner } from '../spinner/spinner';
import { AccountSetupLoader } from '../account-setup-loader/account-setup-loader';
import { Loader } from '../../../services/loader';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-loader-container',
  imports: [Spinner, AccountSetupLoader, AsyncPipe],
  templateUrl: './loader-container.html',
  styleUrl: './loader-container.scss',
})
export class LoaderContainer {
  private loaderService: Loader = inject(Loader);

  protected loading: Observable<boolean>;
  protected accountSetupLoading: Observable<boolean>;

  constructor() {
    this.loading = this.loaderService.loading$;
    this.accountSetupLoading = this.loaderService.accountSetupLoading$;
  }
}
