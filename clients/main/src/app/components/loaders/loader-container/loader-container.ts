import { Component } from '@angular/core';
import { Spinner } from '../spinner/spinner';

@Component({
  selector: 'app-loader-container',
  imports: [Spinner],
  templateUrl: './loader-container.html',
  styleUrl: './loader-container.scss',
})
export class LoaderContainer {}
