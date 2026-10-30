import { Component } from '@angular/core';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-account-setup-loader',
  imports: [Spinner],
  templateUrl: './account-setup-loader.html',
  styleUrl: './account-setup-loader.scss',
})
export class AccountSetupLoader {}
