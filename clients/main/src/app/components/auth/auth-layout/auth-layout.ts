import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

/** One selling point shown on the brand panel. */
interface AuthBrandBenefit {
  icon: string;
  text: string;
}

/**
 * Branded frame for the sign-in and sign-up pages.
 *
 * Wide screens show a split screen: a brand panel (logo, value statement and
 * benefits) beside the projected form. Tablets and phones hide the panel and
 * show a compact logo above the form instead.
 * Usage: `<app-auth-layout>` around the page's heading and form.
 */
@Component({
  selector: 'app-auth-layout',
  imports: [MatIconModule, NgOptimizedImage],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  protected readonly benefits: AuthBrandBenefit[] = [
    { icon: 'meetingRoom', text: $localize`See every room's status, floor by floor` },
    { icon: 'groups', text: $localize`Work together with owners and managers` },
    { icon: 'privacyTip', text: $localize`Secure, accessible and simple to use` },
  ];
}
